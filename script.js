$(document).ready(() => {
    // Function to fetch and display notes
    const fetchNotes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/notes');
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            const notes = await response.json();
            displayNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            showError('Failed to fetch notes. Please try again.');
        }
    };

    // Display notes in UI
    const displayNotes = (notes) => {
        const notesContainer = $('#notes');
        notesContainer.empty();
        if (notes.length === 0) {
            notesContainer.append('<p>No notes found.</p>');
        } else {
            notes.forEach(note => {
                notesContainer.append(`
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${note.title}</h5>
                            <p class="card-text">${note.content}</p>
                            <button class="btn btn-primary btn-sm mr-2 edit-btn" data-id="${note._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${note._id}">Delete</button>
                        </div>
                    </div>
                `);
            });
            // Attach event listeners to dynamically created buttons
            $('.edit-btn').click(editNote);
            $('.delete-btn').click(deleteNote);
        }
    };

    // Show error message
    const showError = (message) => {
        $('#notes').html(`<div class="alert alert-danger">${message}</div>`);
    };

    // Event listener for Add Note button
    $('#addNoteBtn').click(() => {
        $('#noteModalLabel').text('Add Note');
        $('#noteTitle').val('');
        $('#noteContent').val('');
        $('#saveNoteBtn').data('action', 'add');
        $('#noteModal').modal('show');
    });

    // Event listener for Save Note button
    $('#saveNoteBtn').click(async () => {
        const action = $('#saveNoteBtn').data('action');
        const url = action === 'add' ? 'http://localhost:5000/api/notes' : `http://localhost:5000/api/notes/${$('#saveNoteBtn').data('id')}`;
        const method = action === 'add' ? 'POST' : 'PUT';
        const data = {
            title: $('#noteTitle').val(),
            content: $('#noteContent').val()
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to save note');
            }
            $('#noteModal').modal('hide');
            fetchNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            showError('Failed to save note. Please try again.');
        }
    });

    // Event listener for Edit Note button
    const editNote = async (event) => {
        const noteId = $(event.target).data('id');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch note');
            }
            const note = await response.json();
            $('#noteModalLabel').text('Edit Note');
            $('#noteTitle').val(note.title);
            $('#noteContent').val(note.content);
            $('#saveNoteBtn').data('action', 'edit');
            $('#saveNoteBtn').data('id', noteId);
            $('#noteModal').modal('show');
        } catch (error) {
            console.error('Error fetching note for editing:', error);
            showError('Failed to fetch note for editing. Please try again.');
        }
    };

    // Event listener for Delete Note button
    const deleteNote = async (event) => {
        const noteId = $(event.target).data('id');
        try {
            // Show confirmation modal before deleting
            $('#confirmDeleteModal').modal('show');
            $('#confirmDeleteBtn').data('id', noteId); // Set noteId in modal button data
        } catch (error) {
            console.error('Error showing delete confirmation modal:', error);
            showError('Failed to delete note. Please try again.');
        }
    };

    // Event listener for Confirm Delete button in modal
    $('#confirmDeleteBtn').click(async () => {
        const noteId = $('#confirmDeleteBtn').data('id');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            $('#confirmDeleteModal').modal('hide');
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            showError('Failed to delete note. Please try again.');
        }
    });

    // Fetch notes when the page loads
    fetchNotes();
});
