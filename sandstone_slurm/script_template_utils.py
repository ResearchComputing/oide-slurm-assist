import re
import json
import os
from sandstone import settings
from jsonschema import Draft4Validator
from jsonschema.exceptions import SchemaError

class TemplateFinder(object):
    """
    Finds all script templates
    """

    @staticmethod
    def find_all_templates():
        # find all the templates and return
        all_templates = []
        base_path = settings.SANDSTONE_TEMPLATES_DIR
        files = os.listdir(base_path)

        for filename in files:
            filepath = os.path.join(base_path, filename)
            if os.path.isfile(filepath):
                ext = os.path.splitext(filepath)[1]
                if ext == '.sh':
                    all_templates.append(BashTemplate(filepath))
                elif ext == '.json':
                    json_template = JSONTemplate(filepath)
                    if json_template.is_valid_schema():
                        all_templates.append(json_template)
                    else:
                        # ignore the template
                        print 'Template is not valid'
        return all_templates

class BaseTemplate(object):
    """
    Base Script Template
    """

    def __init__(self, filename):
        self.filename = filename
        with open(self.filename) as template_file:
            self._raw_file_data = template_file.read()

    def parse(self):
        raise NotImplementedError('Method not implemented')


class JSONTemplate(BaseTemplate):
    """
    Represents a JSON template
    """

    def __init__(self, filename):
        super(JSONTemplate, self).__init__(filename)

    def is_valid_schema(self):

        parsed_json = self.parse()

        if not (parsed_json['title'] and parsed_json['description'] and parsed_json['command']):
            return False

        variables = parsed_json['variables']
        try:
            Draft4Validator.check_schema(variables)
            return True
        except SchemaError:
            return False

    def parse(self):
        return json.loads(self._raw_file_data)


class BashTemplate(BaseTemplate):
    """
    Represents a Bash template
    """

    _template_name = ''

    def __init__(self, filename):
        super(BashTemplate, self).__init__(filename)
        self._template_name = filename

    def parse(self):
        # parsing logic
        variables = []
        commands = []

        description = ''


        for line in self._raw_file_data.split('\n'):
            # is sbatch directive or a blank line, continue
            if line.startswith('#SBATCH') or line == '' or line.startswith('#'):
                continue
            elif line.startswith('#SANDSTONE_DESCRIPTION'):
                # specifies the description
                description = line.split('=')[1]
            else:
                # it is a command
                # get line till a '#' is seen
                command = line.split('#')[0].strip()
                commands.append(command)
                # get all variables
                variables.extend([m[0] for m in re.findall(r'(\$SANDSTONE(_(\w){1,}){1,})', command)])
        parsed_object = {
            'template_name': self._template_name,
            'description': description,
            'command': '\n'.join(commands),
            'variables': {
                'type': 'object',
                'properties': {}
            }
        }

        for variable in variables:
            current_variable = {
                'type': 'string',
                'description': '',
                'title': variable
            }
            parsed_object['variables']['properties'][variable] = current_variable

        return parsed_object
