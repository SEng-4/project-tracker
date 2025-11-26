import pytest
from app import app, tasks, users, create_task

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
    create_task("Sample Task", "Sample Description", 1, None)

    response = client.get('/list_tasks')
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["name"] == "Sample Task"
    assert response.json[0]["description"] == "Sample Description"
    assert response.json[0]["status"] == 1

def test_update_task_endpoint(client):
    tasks.clear()

    create_task("Task to Update", "Update this task", 0, None)

    data = {
        "id": 3,
        "status": 2
    }
    response = client.post('/update_task', json=data)
    assert response.status_code == 200
    assert response.json["message"] == "Task updated successfully."
    assert response.json["task"]["status"] == 2

    newData = {
        "id": 999,
        "status": 3
    }
    response = client.post('/update_task', json=newData)
    assert response.status_code == 404
    assert response.json["error"] == "Task not found."

def test_list_users(client):
    response = client.get('/list_users')
    assert response.status_code == 200
    assert len(response.json) == len(users)
    assert response.json[0]["username"] == "alice_smith"
    assert response.json[1]["username"] == "bob_johnson"

def test_create_task_with_user(client):
    tasks.clear()

    data = {
        "name": "Task with User",
        "description": "This task is assigned to a user",
        "status": 1,
        "user_id": 0  # Assign to Alice
    }
    response = client.post('/create_task', json=data)
    assert response.status_code == 201
    assert response.json == {"message": "Task created successfully."}
    assert len(tasks) == 1
    assert tasks[0].user.id == 0
    assert tasks[0].user.username == "alice_smith"

    data["user_id"] = 999  # Non-existent user
    response = client.post('/create_task', json=data)
    assert response.status_code == 400
    assert response.json["error"] == "No user found with id 999."