from zope.interface import Interface
from zope import schema

class ITCAAContentish(Interface):
    """Marker interface for TCAA content items
    """

class ITCAASettings(Interface):
    """Describes registry records
    """
    social_links = schema.List(
            title=u"Social Links",
            description=u"Social link used on the site, format: title|url, 1 per line",
            value_type=schema.TextLine()
        )
