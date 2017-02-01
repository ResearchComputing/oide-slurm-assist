import os
import mock
import pwd
import json
from sandstone.lib.handlers.base import BaseHandler
from sandstone.lib.test_utils import TestHandlerBase
from sandstone import settings

EXEC_USER = pwd.getpwuid(os.getuid())[0]
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'testfiles')

class ScriptTemplateHandlerTestCase(TestHandlerBase):

    @mock.patch.object(BaseHandler, 'get_secure_cookie', return_value=EXEC_USER)
    def test_get_templates(self, m):
        settings.SANDSTONE_TEMPLATES_DIR = TEMPLATES_DIR
        response = self.fetch(
            '/slurm/a/scripttemplates',
            method='GET',
            follow_redirects=False
        )
        self.assertEqual(response.code, 200)

        json_response = json.loads(response.body)
        self.assertIsNotNone(json_response['templates'])
        self.assertEqual(len(json_response['templates']), 3)
