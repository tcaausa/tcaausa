# $Id$

"""
TCAA Page

A standard page on the site
"""

__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]


from five import grok
from zope import schema
from plone.directives import form

from plone.namedfile.interfaces import IImageScaleTraversable
from plone.namedfile.field import NamedBlobImage

from plone.app.textfield import RichText

from tcaa.content.basepage import IBasePage 

class IPage(IBasePage):
    """Describes a page

    We mix in IImageScaleTraversable so that we can use the @@images view to
    look up scaled versions of the 'image' field
    """


class View(grok.View):
    """Default view (called "@@view" for a page.

    The associated template is found in page_templates/view.pt
    and it makes use of the @@fragment view
    """
    
    grok.context(IPage)
    grok.require('zope2.View')
    grok.name('view')

class Fragment(grok.View):
    """A view that returns the markup fragment for a page. Can
    be called directly or by used in another view.

    The associated template is found in page_templates/fragment.pt
    """
    grok.context(IPage)
    grok.require('zope2.View')
    grok.name('fragment')

