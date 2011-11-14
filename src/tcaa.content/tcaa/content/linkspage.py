# $Id$

"""
TCAA Links Page

A page that uses naviationImages to link to other pages on the site
"""

__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]


from five import grok
from zope import schema

from z3c.relationfield.schema import RelationList, RelationChoice
from plone.formwidget.contenttree import ObjPathSourceBinder

from tcaa.content.basepage import IBasePage 

# View
from zope.component import getMultiAdapter
from plone.memoize.instance import memoize


class ILinksPage(IBasePage):
    """Describes a links page

    """
    featuredPages = RelationList(
            title=u"Featured Links",
            description=u"Six other pages to be listed on this page",
            value_type=RelationChoice(
                source=ObjPathSourceBinder(
                    object_provides=IBasePage.__identifier__
                ),
            )
        )


class View(grok.View):
    """Default view (called "@@view" for a page.

    The associated template is found in linkspage_templates/view.pt.
    """
    
    grok.context(ILinksPage)
    grok.require('zope2.View')
    grok.name('view')

class Fragment(grok.View):
    """A view that returns the markup fragment for a links page that
    can be called directly or by another view.

    template: linkspage_templates/fragment.pt
    """
    grok.context(ILinksPage)
    grok.require('zope2.View')
    grok.name('fragment')

    def update(self):
        """Prepare information for the template
        """
        self.hasFeaturedPages = len(self.featuredPages()) > 0

    @memoize
    def featuredPages(self):
        pages = []
        if self.context.featuredPages is not None:
            for ref in self.context.featuredPages:
                obj = ref.to_object
                scales = getMultiAdapter((obj, self.request), name='images')
                scale = scales.scale('navigationImage', width=64, height=64) #, direction='down')
                imageTag = None
                if scale is not None:
                    imageTag = scale.tag()
                pages.append({
                    'url': obj.absolute_url(),
                    'title': obj.title,
                    'description': obj.description,
                    'imageTag': imageTag,
                    })
        return pages

