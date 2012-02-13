
import json
from five import grok
from Acquisition import aq_inner, aq_parent
from plone.memoize.instance import memoize
from zope.component import getMultiAdapter
from zope.interface import Interface
from Products.CMFCore.utils import getToolByName
from tcaa.content.interfaces import ITCAAContentish
from tcaa.content.section import ISection
from tcaa.content.basepage import IBasePage


class View(grok.View):
    """Default view for TCAA content which handles XMLHttpRequests

    The associated template is found in browser_templates/view.pt
    and it makes use of the @@fragment view
    """
    
    grok.context(ITCAAContentish)
    grok.require('zope2.View')
    grok.name('view')

    def __call__(self):
        if self.request.environ.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            fragment_view = getMultiAdapter((self.context, self.request), name="fragment")
            return fragment_view()
        return super(View, self).__call__()


class PageData(grok.View):
    """Utility view that builds the page data json object
    
    It is available for all contexts.
    """

    grok.context(Interface)
    grok.require('zope2.View')
    grok.name('pagedata')

    def update(self):
        self.pagedata = self.getPageData()

    def render(self):
        return '<script type="text/javascript">var pageData = %s;</script>' % self.pagedata

    @memoize
    def getPageData(self):
        return json.dumps(self.createTree())
    
    @memoize
    def createTree(self):
        pc = getToolByName(self.context, 'portal_catalog')
        pu = getToolByName(self.context, 'portal_url')
        portal = pu.getPortalObject()
        path = portal.getPhysicalPath()
        q = {'path': {'query': '/'.join(path), 'depth':1},
             'review_state' : 'published',
             'sort_on': 'getObjPositionInParent',
             'object_provides':ITCAAContentish.__identifier__,
             }
        tree = []
        results = pc(q)
        for branch in results:
            branch_nodes = []
            if branch.portal_type != 'tcaa.content.Section':
                url = "/%s" % (branch.id)
                branch_nodes.append({"url": url, "title": branch.Title})
            else:
                path = list(portal.getPhysicalPath())
                path.append(branch.id)
                q['path'] = {'query': '/'.join(path), 'depth':1}
                nodes = pc(q)
                for node in nodes:
                    url = "/%s/%s" % (branch.id, node.id)
                    branch_nodes.append({"url": url, "title": node.Title})
            tree.append(branch_nodes)
        return tree

class SectionSiblings(grok.View):

    grok.context(IBasePage)
    grok.require('zope2.View')
    grok.name('section-siblings')

    def update(self):
        """Check that the context is within a Section and return siblings
        Otherwise return an empty list
        """
        parent = aq_parent(self.context)
        if ISection.providedBy(parent):
            self.siblings = self.getSiblings()
        else:
            context = aq_inner(self.context)
            url = "/%s" % (context.id,)
            self.siblings = [{"url":url, "title":context.Title(), "current":True}]

    def render(self):
        return self.siblings

    def getSiblings(self):
        pc = getToolByName(self.context, 'portal_catalog')
        context = aq_inner(self.context)
        parent = aq_parent(self.context)
        path = parent.getPhysicalPath()
        q = {'path': {'query': '/'.join(path), 'depth': 1},
             'review_state': 'published',
             'sort_on': 'getObjPositionInParent',
             'object_provides':ITCAAContentish.__identifier__,
             }
        results = pc(q)
        siblings = []
        for sibling in results:
            url = "/%s/%s" % (parent.id, sibling.id)
            data = {"url": url, "title": sibling.Title, "current": sibling.id == context.id }
            siblings.append(data)
        return siblings

class CustomPageStyle(grok.View):
    """Helper view for IBasePage implementors that
    will generate the right styling for their containing div
    when running through Diazo or direct to the admin interface.
    """
    grok.context(IBasePage)
    grok.require('zope2.View')
    grok.name('custom-page-style')

    def update(self):
        context = aq_inner(self.context)
        scales = getMultiAdapter((context, self.request), name='images')
        scale = scales.scale('backgroundImage', width=875, height=568)

        if scale is None and context.pageBackgroundColor == '':
            self.style = None
            return

        #self.style = "height:568px; padding:100px 80px; margin:-100px -80px;"
        self.style = "height:568px; padding:100px 0px; margin:-100px 0px;"
        bg_img = ''
        bg_color = ''
        if scale:               
            bg_img = "url(%s) no-repeat 0 0" % (scale.url)
        if context.pageBackgroundColor:
            bg_color = "#%s" % context.pageBackgroundColor
        self.style = "%s background:%s %s;" % (self.style, bg_img, bg_color)
               
    def render(self):
        #return self.style
        return self

    def page_style(self):
        return self.style

    def content_style(self):
        context = aq_inner(self.context)
        bg_color = context.backgroundColor
        bo_color = context.borderColor
        element_style = ''
        if bg_color:
            element_style += "background-color:#%s; " % (bg_color,)
        if bo_color:
            element_style += "border: 1px solid #%s; " %(bo_color,)
        return element_style

       

