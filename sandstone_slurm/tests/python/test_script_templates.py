import unittest
import mock
import json
import os
from sandstone import settings
from sandstone_slurm.script_template_utils import BashTemplate, JSONTemplate, TemplateFinder

TEST_JSON_FILE = os.path.join(os.path.dirname(__file__), 'testfiles/test_json.json')
TEST_BASH_FILE = os.path.join(os.path.dirname(__file__), 'testfiles/test_script.sh')
TEST_COMPLEX_BASH_FILE = os.path.join(os.path.dirname(__file__), 'testfiles/test_complex_bash.sh')
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'testfiles')

class TemplateFinderTestCase(unittest.TestCase):
    def setUp(self):
        settings.SANDSTONE_TEMPLATES_DIR = TEMPLATES_DIR

    def test_template_finder(self):
        all_templates = TemplateFinder.find_all_templates()
        self.assertEqual(len(all_templates), 3)


class JSONTemplateParseTestCase(unittest.TestCase):
    def setUp(self):
        self.json_template = JSONTemplate(TEST_JSON_FILE)

    def test_valid_json(self):
        self.assertTrue(self.json_template.is_valid_schema())

class BashTemplateParseTestCase(unittest.TestCase):

    def test_template_properties(self):
        self.bash_template = BashTemplate(TEST_BASH_FILE)
        parsed_object = self.bash_template.parse()
        self.assertEqual(parsed_object['template_name'], TEST_BASH_FILE)
        self.assertEqual(parsed_object['description'], "")
        self.assertEqual(parsed_object['command'], "python $SANDSTONE_FILENAME")
        self.assertEqual(len(parsed_object['variables']['properties'].keys()), 1)
        self.assertItemsEqual(parsed_object['variables']['properties'].keys(), ['$SANDSTONE_FILENAME'])

    def test_complex_template_properties(self):
        self.bash_template = BashTemplate(TEST_COMPLEX_BASH_FILE)
        parsed_object = self.bash_template.parse()
        self.assertEqual(parsed_object['template_name'], TEST_COMPLEX_BASH_FILE)
        self.assertEqual(parsed_object['description'], "")
        self.assertEqual(parsed_object['command'], "export OMP_NUM_THREADS=$SANDSTONE_NUM_THREADS\nsrun -n 20 -c 4 $SANDSTONE_SCRIPT_NAME")
        self.assertEqual(len(parsed_object['variables']['properties'].keys()), 2)
        self.assertItemsEqual(parsed_object['variables']['properties'].keys(), ['$SANDSTONE_NUM_THREADS', '$SANDSTONE_SCRIPT_NAME'])
