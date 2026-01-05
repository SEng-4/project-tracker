package com.jol.j_project_tracker.Resource;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jol.j_project_tracker.Entity.Task;
import com.jol.j_project_tracker.Repository.TaskRepository;
import com.jol.j_project_tracker.Repository.UserRepository;

@RestController
@RequestMapping("/tasks")
public class TaskResource {
	@Autowired
	private TaskRepository taskRepository;

	@Autowired
	private UserRepository userRepository;

	// GET /tasks/ - return all tasks
	// GET /tasks?userId={id} - return tasks assigned to a specific ID
	@GetMapping
	public ResponseEntity<List<Task>> getAllTasks(@RequestParam(required = false) Long userId) {
		if (userId != null) {
			return ResponseEntity.ok(taskRepository.findByAssignedUserId(userId));
		}

		return ResponseEntity.ok(taskRepository.findAll());
	}

	// GET /tasks/{id} - return specific task
	@GetMapping("/{id}")
	public ResponseEntity<?> getTaskById(@PathVariable Long id) {
		Optional<Task> task = taskRepository.findById(id);
		if (task.isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Task not found with id: " + id));
		} else {
			return ResponseEntity.ok(task.get());
		}
	}

	// POST /tasks - create new task
	@PostMapping
	public ResponseEntity<?> createTask(@RequestBody Task task) {
		if (task.getAssignedUserId() != null) {
			if (!userRepository.existsById(task.getAssignedUserId())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("error", "User not found with id: " + task.getAssignedUserId()));
			}
		}

		Task savedTask = taskRepository.save(task);
		return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
	}

	// PUT /tasks/{id} - update existing task
	@PutMapping("/{id}")
	public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
		return taskRepository.findById(id).map(task -> {
			// Validate assigned user exists if provided
			if (taskDetails.getAssignedUserId() != null) {
				if (!userRepository.existsById(taskDetails.getAssignedUserId())) {
					return ResponseEntity.status(HttpStatus.BAD_REQUEST)
							.body(Map.of("error", "User not found with id: " + taskDetails.getAssignedUserId()));
				}
			}

			task.setName(taskDetails.getName());
			task.setDescription(taskDetails.getDescription());
			task.setStatus(taskDetails.getStatus());
			task.setAssignedUserId(taskDetails.getAssignedUserId());

			Task updatedTask = taskRepository.save(task);
			return ResponseEntity.ok(updatedTask);
		}).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found with id: " + id)));
	}

	// DELETE /tasks - delete ALL tasks (dangerous)
	// TODO: Add protection against blindly deleting all tasks?
	@DeleteMapping
	public ResponseEntity<?> deleteAllTasks() {
		taskRepository.deleteAll();
		return ResponseEntity.ok(Map.of("message", "All tasks deleted successfully"));
	}

	// DELETE /tasks/{id} - delete specific task
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteTask(@PathVariable Long id) {
		if (!taskRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found with id: " + id));
		}

		taskRepository.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
	}
}