# $Id$

"""
TCAA Theme Marker Inteface 
"""
__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]

from zope.interface import Interface

class ITCAATheme(Interface):
    """Marker interface that defines a ZTK browser layer. We can reference 
    this in the 'layer' attribute of ZCML <browser:* /> directives to ensure
    the relevant registration only takes effect when this theme is installed.

    The browser layer is installed via the browserlayer.xml GenericSetup
    import step.
    """
