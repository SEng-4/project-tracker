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
import org.springframework.web.bind.annotation.RestController;

import com.jol.j_project_tracker.Entity.User;
import com.jol.j_project_tracker.Repository.TaskRepository;
import com.jol.j_project_tracker.Repository.UserRepository;

@RestController
@RequestMapping("/users")
public class UserResource {
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TaskRepository taskRepository;

	// GET /users - get all users
	@GetMapping
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(userRepository.findAll());
	}

	// GET /users/{id} - get specific user
	@GetMapping("/{id}")
	public ResponseEntity<?> getUserById(@PathVariable Long id) {
		Optional<User> user = userRepository.findById(id);
		if (user.isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Task not found with id: " + id));
		} else {
			return ResponseEntity.ok(user.get());
		}
	}

	// POST /users - create new user
	@PostMapping
	public ResponseEntity<?> createUser(@RequestBody User user) {
		// usernames must be unique
		if (userRepository.existsByUsername(user.getUsername())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("error", "Username already exists: " + user.getUsername()));
		}

		User savedUser = userRepository.save(user);
		return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
	}

	// PUT /users/{id} - update existing user
	@PutMapping("/{id}")
	public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
		return userRepository.findById(id).map(user -> {
			if (!user.getUsername().equals(userDetails.getUsername())
					&& userRepository.existsByUsername(userDetails.getUsername())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("error", "Username already exists: " + userDetails.getUsername()));
			}

			user.setUsername(userDetails.getUsername());
			user.setDisplayName(userDetails.getDisplayName());
			user.setRole(userDetails.getRole());

			User updatedUser = userRepository.save(user);
			return ResponseEntity.ok(updatedUser);
		}).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found with id: " + id)));
	}

	// DELETE /users/{id} - delete specific user
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteUser(@PathVariable Long id) {
		if (!userRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found with id: " + id));
		}

		// must unassign any task before deleting the user, otherwise the task could be
		// deleted
		List<com.jol.j_project_tracker.Entity.Task> userTasks = taskRepository.findByAssignedUserId(id);
		for (com.jol.j_project_tracker.Entity.Task task : userTasks) {
			task.setAssignedUserId(null);
			taskRepository.save(task);
		}

		userRepository.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
	}

	// DELETE /users - NOT ALLOWED.
	@DeleteMapping
	public ResponseEntity<?> deleteAllUsers() {
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
				.body(Map.of("error", "Deleting all users is not allowed. Must specify user ID."));
	}
}
