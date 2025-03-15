import tkinter as tk
from tkinter import filedialog, Menu, ttk
import os
import json

CONFIG_FILE = "app_list.json"

# Initialize main window
root = tk.Tk()
root.title("AVoidLauncher 🚀")

# Get screen size
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()

# Set window size and limits (relative to screen)
DEFAULT_WIDTH = int(screen_width * 0.5)
DEFAULT_HEIGHT = int(DEFAULT_WIDTH * 9 / 16)  # Maintain 16:9 aspect ratio

MAX_WIDTH = int(screen_width * 0.8)
MAX_HEIGHT = int(MAX_WIDTH * 9 / 16)  # Maintain 16:9 aspect ratio

MIN_WIDTH = 480
MIN_HEIGHT = int(MIN_WIDTH * 9 / 16)  # Maintain 16:9 aspect ratio

# Set window size and limits
root.geometry(f"{DEFAULT_WIDTH}x{DEFAULT_HEIGHT}")
root.minsize(MIN_WIDTH, MIN_HEIGHT)
root.maxsize(MAX_WIDTH, MAX_HEIGHT)

# Prevent fullscreen mode
root.attributes('-fullscreen', False)

# Function to maintain aspect ratio
def enforce_aspect_ratio(event):
    width = root.winfo_width()
    height = int(width * 9 / 16)  
    if abs(height - root.winfo_height()) > 10:
        root.geometry(f"{width}x{height}")

root.bind("<Configure>", enforce_aspect_ratio)

# Apply Always Dark Mode
bg_color = "#2E2E2E"
fg_color = "white"
btn_color = "#555"

root.config(bg=bg_color)

# Load saved apps
def load_apps():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as file:
            return json.load(file)
    return []

# Save apps
def save_apps():
    with open(CONFIG_FILE, "w") as file:
        json.dump(app_list, file)

# Add an application
def add_app():
    file_path = filedialog.askopenfilename(filetypes=[("Executables", "*.exe")])
    if file_path:
        app_entry.delete(0, tk.END)
        app_entry.insert(0, os.path.basename(file_path))
        app_entry.focus()
        app_entry_path.set(file_path)
        entry_frame.pack(side=tk.TOP, fill=tk.X, padx=10, pady=5)

# Confirm app addition
def confirm_add_app():
    app_name = app_entry.get().strip()
    file_path = app_entry_path.get()
    
    if app_name and file_path:
        app_list.append({"name": app_name, "path": file_path})
        update_app_list()
        save_apps()
        app_entry.delete(0, tk.END)
        app_entry_path.set("")
        entry_frame.pack_forget()

# Remove selected application
def remove_app(index):
    del app_list[index]
    update_app_list()
    save_apps()

# Launch selected application
def launch_app(index):
    os.startfile(app_list[index]["path"])

# Open file location
def open_file_location(index):
    file_path = app_list[index]["path"]
    folder_path = os.path.dirname(file_path)
    os.startfile(folder_path)

# Right-click menu for apps
def show_context_menu(event, index):
    context_menu = Menu(root, tearoff=0, bg="#333", fg="white")
    context_menu.add_command(label="▶ Launch", command=lambda: launch_app(index))
    context_menu.add_command(label="📂 Open File Location", command=lambda: open_file_location(index))
    context_menu.add_separator()
    context_menu.add_command(label="❌ Remove", command=lambda: remove_app(index))
    context_menu.post(event.x_root, event.y_root)

# Right-click anywhere to add an app
def show_global_menu(event):
    global_menu = Menu(root, tearoff=0, bg="#333", fg="white")
    global_menu.add_command(label="➕ Add Application", command=add_app)
    global_menu.post(event.x_root, event.y_root)

# Update App List UI
def update_app_list():
    for widget in app_list_frame.winfo_children():
        widget.destroy()

    for index, app in enumerate(app_list):
        app_row = tk.Frame(app_list_frame, bg=bg_color)
        app_row.pack(fill=tk.X, pady=5)

        app_label = tk.Label(app_row, text=app["name"], font=("Arial", 12, "bold"), fg=fg_color, bg=bg_color, anchor="w")
        app_label.pack(side=tk.LEFT, padx=10, fill=tk.X, expand=True)

        launch_btn = tk.Button(app_row, text="▶", font=("Arial", 12), command=lambda i=index: launch_app(i), 
                               bd=0, bg=bg_color, fg=fg_color, activebackground=bg_color, cursor="hand2")
        launch_btn.pack(side=tk.RIGHT, padx=10)

        app_label.bind("<Button-3>", lambda event, i=index: show_context_menu(event, i))

        # Add separator line
        separator = ttk.Separator(app_list_frame, orient="horizontal")
        separator.pack(fill=tk.X, padx=10, pady=2)

# UI Elements

## Top Bar
top_bar = tk.Frame(root, bg="#1E1E1E", height=30)
top_bar.pack(side=tk.TOP, fill=tk.X)

## Add App Button
add_btn = tk.Button(top_bar, text="➕", font=("Arial", 14), command=add_app, bd=0, bg="#1E1E1E", fg="white", 
                    activebackground="#1E1E1E", cursor="hand2")
add_btn.pack(side=tk.LEFT, padx=5, pady=2)

## App Name Entry (Hidden by Default)
entry_frame = tk.Frame(root, bg=bg_color)
entry_frame.pack_forget()

app_entry_label = tk.Label(entry_frame, text="App Name:", font=("Arial", 9), fg=fg_color, bg=bg_color)
app_entry_label.pack(side=tk.LEFT, padx=5)

app_entry = tk.Entry(entry_frame, font=("Arial", 10), bg=bg_color, fg=fg_color, insertbackground=fg_color, width=15)
app_entry.pack(side=tk.LEFT, padx=5)

confirm_btn = tk.Button(entry_frame, text="✔", command=confirm_add_app, font=("Arial", 10, "bold"), bg=btn_color, fg=fg_color,
                        bd=0, activebackground=btn_color, cursor="hand2", width=2)
confirm_btn.pack(side=tk.LEFT, padx=5)

app_entry_path = tk.StringVar()

## List Frame for Apps
app_list_frame = tk.Frame(root, bg=bg_color)
app_list_frame.pack(pady=5, fill=tk.BOTH, expand=True)

# Bind Events
root.bind("<Button-3>", show_global_menu)

# Load saved apps
app_list = load_apps()
update_app_list()

# Run the application
root.mainloop()
