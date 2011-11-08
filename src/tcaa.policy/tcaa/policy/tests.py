

import unittest2 as unittest

from tcaa.policy.testing import TCAA_POLICY_INTEGRATION_TESTING

class TestSetup(unittest.TestCase):
    layer = TCAA_POLICY_INTEGRATION_TESTING

    def test_portal_title(self):
        portal = self.layer['portal']
        self.assertEqual("TCAA USA", portal.getProperty('title'))

    def test_portal_description(self):
        portal = self.layer['portal']
        self.assertEqual("Welcome to TCAA's website", portal.getProperty('description'))
