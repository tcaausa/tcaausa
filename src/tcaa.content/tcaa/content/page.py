
from five import grok
from zope import schema
from plone.directives import form

from plone.namedfile.interfaces import IImageScaleTraversable
from plone.namedfile.field import NamedBlobImage

from plone.app.textfield import RichText

class IPage(form.Schema, IImageScaleTraversable):
    """Describes a page

    We mix in IImageScaleTraversable so that we can use the @@images view to
    look up scaled versions of the 'image' field
    """

    content = RichText(
            title=u"Page Content",
            description=u"Rich text for page",
        )


class View(grok.View):
    """Default view (called "@@view" for a page.

    The associated template is found in page_templates/view.pt.
    """
    
    grok.context(IPage)
    grok.require('zope2.View')
    grok.name('view')

    def update(self):
        """Prepare information for the template
        """
        pass
