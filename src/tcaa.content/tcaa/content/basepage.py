# $Id$

"""
TCAA base page 
"""
__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]



from zope import schema
from plone.directives import form

from plone.namedfile.interfaces import IImageScaleTraversable
from plone.namedfile.field import NamedBlobImage

from plone.app.textfield import RichText

class IBasePage(form.Schema, IImageScaleTraversable):
    """Describes a page

    We mix in IImageScaleTraversable so that we can use the @@images view to
    look up scaled versions of the 'image' field
    """

    content = RichText(
            title=u"Page Content",
            description=u"Rich text for page",
        )
    borderColor = schema.TextLine(
            title=u"Border Color",
            description=u"A hex value for the border color of text on this page",
            default=u"eeeeee",
        )
    backgroundColor = schema.TextLine(
            title=u"Background Color",
            description=u"A hex value for the background color of text on this page",
            default=u"eeeeee",
        )
    backgroundImage = NamedBlobImage(
            title=u"Background Image",
            description=u"An image used for the background of this page",
            required=False,
        )
    navigationImage = NamedBlobImage(
            title=u"Navigation Image",
            description=u"An image used on other pages when linking to this page",
            required=False,
        )

