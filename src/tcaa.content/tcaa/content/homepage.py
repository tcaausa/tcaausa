# $Id$

"""
TCAA Homepage
"""
__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]

from five import grok
#from zope import schema
#from plone.directives import form

from z3c.relationfield.schema import RelationList, RelationChoice
from plone.formwidget.contenttree import ObjPathSourceBinder

from tcaa.content.basepage import IBasePage 

# View
from zope.component import getMultiAdapter
from plone.memoize.instance import memoize

class IHomepage(IBasePage):
    """Describes a tcaa homepage

    """

    featuredPages = RelationList(
            title=u"Featured Links",
            description=u"Three other pages to be highlighted on the homepage",
            value_type=RelationChoice(
                source=ObjPathSourceBinder(
                    object_provides=IBasePage.__identifier__
                ),
                required=False,
            )
        )

class View(grok.View):
    """Default view (@@view) for a homepage

    The associated template is found in homepage_templates/view.pt.
    """

    grok.context(IHomepage)
    grok.require('zope2.View')
    grok.name('view')
    
    def update(self):
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

