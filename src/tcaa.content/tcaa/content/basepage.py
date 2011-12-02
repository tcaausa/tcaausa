# $Id$

"""
TCAA base page 
"""
__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]


from zope import schema
from zope.schema.vocabulary import SimpleVocabulary, SimpleTerm
from plone.directives import form
from plone.namedfile.interfaces import IImageScaleTraversable
from plone.namedfile.field import NamedBlobImage
from plone.app.textfield import RichText
from tcaa.content.interfaces import ITCAAContentish
from plone.z3cform.textlines.textlines import TextLinesFieldWidget

content_layout_options = SimpleVocabulary(
        [SimpleTerm(value=u"content-left",          title=u"Align Left"),
         SimpleTerm(value=u"content-right",         title=u"Align Right"),
         SimpleTerm(value=u"content-wide",          title=u"Fill width"),]
    )


class IBasePage(form.Schema, IImageScaleTraversable, ITCAAContentish):
    """Describes a page

    We mix in IImageScaleTraversable so that we can use the @@images view to
    look up scaled versions of the 'image' field
    """

    content = RichText(
            title=u"Page Content",
            description=u"Rich text for page",
        )

    content_layout = schema.Choice(
            title=u"Page Content Layout",
            description=u"Position at which the above text content should be displayed",
            vocabulary=content_layout_options,
        )

    borderColor = schema.TextLine(
            title=u"Border Color",
            description=u"A hex value for the border color of text on this page",
            required=False,
        )
    backgroundColor = schema.TextLine(
            title=u"Background Color",
            description=u"A hex value for the background color of text on this page",
            required=False,
        )
    backgroundImage = NamedBlobImage(
            title=u"Background Image (875 x 568)",
            description=u"An image used for the background of this page",
            required=False,
        )
    navigationImage = NamedBlobImage(
            title=u"Navigation Image (282 x 224)",
            description=u"An image used on other pages when linking to this page",
            required=False,
        )

