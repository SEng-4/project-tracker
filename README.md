**Note:** As of 05/01/2026, we've re-written the back-end using Spring Boot. This branch (`flask-legacy`) remains for historical purposes, but no changes will be happening here. All the work is in [`main`](https://github.com/SEng-4/project-tracker/tree/main).

---

# Project Tracker

## Setup Instructions

### Installing Git

Git is essential for working on the project on your own machine. The first thing you should install is [Git for Windows](https://git-scm.com/downloads/win). Do not change any of the default options during setup.

After Git for Windows is installed, you should install [GitHub Desktop](https://desktop.github.com/download/), which will just help you set up Git easily by signing directly into your GitHub account.

### Cloning the repository

![](https://i.ibb.co/FL80dXp0/Screenshot-2025-10-04-202556.png)

You can use GitHub Desktop to clone the repository somewhere on your own machine. For simplicity, just place it into your Documents folder.

### Using Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/Download) is the editor you should use for development. It has built-in Git functionality and works well with Python and Flask. Once it is installed, you should install the [Python extension pack](https://marketplace.visualstudio.com/items?itemName=ms-python.python) just to be safe.

### Flask Setup

We're using Flask to power the website. Open a Command Prompt window, and run the following command: `pip --version`, and you should get output just like:

```
pip 25.1.1 from C:\Users\James\AppData\Local\Programs\Python\Python313\Lib\site-packages\pip (python 3.13)
```

If this doesn't work, then Python and/or pip probably isn't a part of your PATH. You could uninstall and reinstall Python (and make sure to choose the `Add Python to PATH` option at the end of the installer!) or add Python to your PATH manually, which can be painful but you can Google it.

If pip is working as expected, great. Run the command `pip install flask` to install Flask to your system-wide Python installation. We're not going to bother with virtual environments because we don't need to run on a Raspberry Pi or on Linux, so just ignore it.

### Run the Site

In the root directory of the repository (e.g. `C:\Users\<your-name>\Documents\project-tracker`), open a Command Prompt window and switch to the directory, *or* open the repository in Visual Studio Code and open a Terminal window by pressing `Ctrl + '` or clicking `View` in the toolbar and then choosing `Terminal` near the end of the menu.

**Run `python app.py`**, and you should see this output:

```
PS C:\Development\project-tracker> python app.py
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

If it all went well, the website can then be accessed by clicking on the link or visiting it in Firefox/Chrome/Edge.

## Using Git in Visual Studio Code

Visual Studio Code has really powerful Git tools built in, so you don't need to use the Command Prompt or GitHub Desktop.

![](https://i.ibb.co/4RdWr357/image.png)

To change the branch, click on the `main` button at the bottom of the Code window. You can switch branch, or create new branches through the menu, but I advise that you make the branch on the GitHub website first, then *pull* the changes and switch to the branch in Code.

> [!TIP]
> Open a Terminal in Code as described above and run the `git pull` command to forcefully refresh any new branches, or commits, if Code isn't catching up as quickly as you'd like.