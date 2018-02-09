import unittest
from api import app
import json
class ApiTestCase(unittest.TestCase):

    def setUp(self):
        self.app=app.test_client()

    def test_get_all_contaniers(self):
        rv=self.app.get("/containers/")
        assert rv.status_code==200
        data=json.loads(rv.data)
        print data
    def test_add_container(self):
        rv=self.app.post("containers/",data=dict(
            variable="selam"
        ))
        assert rv.status_code==200
        print rv.data

    def test_delete_container(self):
        rv=self.app.delete("containers/",)


    #SCHEDULE TESTS #FIXME

class ApiScheduleTestCase(unittest.TestCase):
    def setUp(self):
        self.app=app.test_client()

    def test_get_schedules(self):
        rv=self.app.get("/schedules/")
        assert rv.status_code==200


    def test_deploy(self):
        rv=self.app.get("/schedules/deploy")
        assert rv.status_code==200