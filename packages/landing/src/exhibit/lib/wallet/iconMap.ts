import type { IconType } from 'react-icons';
import {
  FiShoppingCart,
  FiDollarSign,
  FiZap,
  FiPackage,
  FiRepeat,
  FiCoffee,
  FiTruck,
  FiFilm,
  FiMusic,
  FiGlobe,
  FiHome,
  FiActivity,
  FiCreditCard,
} from 'react-icons/fi';

const billIconMap: Record<string, IconType> = {
  Netflix: FiFilm,
  Spotify: FiMusic,
  Internet: FiGlobe,
  'Gym Membership': FiActivity,
  'Car Insurance': FiHome,
};

const budgetIconMap: Record<string, IconType> = {
  'Food & Drink': FiCoffee,
  Transport: FiTruck,
  Shopping: FiShoppingCart,
  Utilities: FiZap,
  Entertainment: FiFilm,
};

const transactionIconMap: Record<string, IconType> = {
  'Food & Drink': FiCoffee,
  Transport: FiTruck,
  Shopping: FiPackage,
  Utilities: FiZap,
  Income: FiDollarSign,
  Transfer: FiRepeat,
};

export const getBillIcon = (name: string): IconType =>
  billIconMap[name] ?? FiCreditCard;

export const getBudgetIcon = (category: string): IconType =>
  budgetIconMap[category] ?? FiDollarSign;

export const getTransactionIcon = (category: string): IconType =>
  transactionIconMap[category] ?? FiDollarSign;
