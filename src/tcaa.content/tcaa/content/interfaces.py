from zope.interface import Interface
from zope import schema

class ITCAAContentish(Interface):
    """Marker interface for TCAA content items
    """

class ITCAASettings(Interface):
    """Describes registry records
    """
    social_links = schema.List(
            title=u"Contact Social Links",
            description=u"Social link used on the contact page, format: title|url, 1 per line",
            value_type=schema.TextLine()
        )
    twitter_account = schema.TextLine(
            title=u"Twitter Account",
            description=u"The Twitter account to link to from the navigation. The last tweet from this account will be displayed on the site",
        )
    facebook_account = schema.TextLine(
            title=u"Facebook Account",
            description=u"The Facebook account to link to from the navigation",
        )
    email_account = schema.TextLine(
            title=u"Email Account",
            description=u"The email account to link to from the navigation",
        )

