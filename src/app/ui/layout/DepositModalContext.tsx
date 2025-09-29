import { createContext, useContext } from 'react';

export interface DepositModalContextValue {
  openDepositWithAmount: (amount: number) => void | Promise<void>;
  closeDepositModal: () => void;
}

const defaultValue: DepositModalContextValue = {
  openDepositWithAmount: () => {},
  closeDepositModal: () => {}
};

export const DepositModalContext = createContext<DepositModalContextValue>(defaultValue);

export const useDepositModal = () => useContext(DepositModalContext);


