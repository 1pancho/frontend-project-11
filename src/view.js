/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const handleForm = (state, elements) => {
    if (state.form.error) {
        elements.feedback.classList.add('text-danger');
        elements.feedback.classList.remove('text-succes');
        elements.feedback.textContent = state.form.error;
    } 
    if (state.form.isValid) {
        elements.input.classList.remove('is-invalid');
    } else {
        elements.input.classList.add('is-invalid');
    }
};

export default (state, elements) => {
    const watchedState = onChange(state, (path) => {
        switch (path) {
            case 'form': {
                handleForm(state, elements);
                break;
            }
        }
    })

    return watchedState;
}