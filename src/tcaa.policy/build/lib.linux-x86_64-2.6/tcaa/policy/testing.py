# $Id$

"""Test fixture setup"""

__author__ = 'Pat Smith <pat.smith@isotoma.com>'
__docformat__ = 'restructuredtext en'
__version__ = '$Revision$'[11:-2]

from plone.app.testing import PloneSandboxLayer
from plone.app.testing import applyProfile
from plone.app.testing import PLONE_FIXTURE
from plone.app.testing import IntegrationTesting

from zope.configuration import xmlconfig

class TcaaPolicy(PloneSandboxLayer):
    defaultBases = (PLONE_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load ZCML
        import tcaa.policy
        xmlconfig.file('configure.zcml',
                tcaa.policy,
                context=configurationContext
                )
    def setUpPloneSite(self, portal):
        applyProfile(portal, 'tcaa.policy:default')

TCAA_POLICY_FIXTURE = TcaaPolicy()
TCAA_POLICY_INTEGRATION_TESTING = IntegrationTesting(
        bases=(TCAA_POLICY_FIXTURE,),
        name="Tcaa:Integration"
    )


