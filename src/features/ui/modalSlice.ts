import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  activeModal: string | null;
  modalData: unknown;
}

const initialState: ModalState = {
  activeModal: null,
  modalData: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ modalName: string; data?: unknown }>,
    ) => {
      state.activeModal = action.payload.modalName;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
