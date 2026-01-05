package com.jol.j_project_tracker.Configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.jol.j_project_tracker.Entity.Task;
import com.jol.j_project_tracker.Entity.TaskStatus;
import com.jol.j_project_tracker.Entity.User;
import com.jol.j_project_tracker.Entity.UserRole;
import com.jol.j_project_tracker.Repository.TaskRepository;
import com.jol.j_project_tracker.Repository.UserRepository;

@Component
public class DataInitialiser implements CommandLineRunner {
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TaskRepository taskRepository;

	@Override
	public void run(String... args) throws Exception {
		// Only initialise with fake data if the repository is empty!
		if (userRepository.count() == 0) {
			User james = userRepository.save(new User("james", "James", UserRole.ADMIN));
			User liam = userRepository.save(new User("liam", "Liam", UserRole.USER));
			User odhran = userRepository.save(new User("odhran", "Odhrán", UserRole.USER));

			System.out.println("Created dummy users.");

			taskRepository.save(new Task("Implement users API",
					"Make users work with proper REST endpoints + permissions", TaskStatus.TO_DO, james.getId()));

			taskRepository.save(new Task("Finalise front-end design",
					"Decide a proper colour scheme, add a header bar, user creation UI, etc.", TaskStatus.DOING,
					liam.getId()));

			taskRepository.save(new Task("Write documentation", "Document all API endpoints thoroughly",
					TaskStatus.TO_DO, james.getId()));

			taskRepository.save(new Task("Add user authentication",
					"Implement Spring Security and (possibly) JWT authentication for login", TaskStatus.TO_DO,
					odhran.getId()));

			taskRepository.save(
					new Task("Re-design backend", "Support proper RESTful endpoints and verbs", TaskStatus.DONE, null));

			taskRepository.save(new Task("Refresh Jira board", "Note advancements and current progress",
					TaskStatus.DONE, liam.getId()));

			System.out.println("Created sample tasks.");
		}
	}
}
