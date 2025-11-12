import pytest
from app import app, tasks, create_task

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"<!DOCTYPE html>" in response.data

def test_create_task_endpoint(client):
    tasks.clear()

    data = {
        "name": "Test Task",
        "description": "This is a test task",
        "status": 0
    }
    response = client.post('/create_task', json=data)
    assert response.status_code == 201
    assert response.json == {"message": "Task created successfully."}
    assert len(tasks) == 1
    assert tasks[0].name == "Test Task"
    assert tasks[0].description == "This is a test task"
    assert tasks[0].status == 0

def test_list_tasks(client):
    tasks.clear()
    create_task("Sample Task", "Sample Description", 1)

    response = client.get('/list_tasks')
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["name"] == "Sample Task"
    assert response.json[0]["description"] == "Sample Description"
    assert response.json[0]["status"] == 1