import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryId } from '../data';

export type TabParamList = {
  Home: undefined;
  Shop: { category?: CategoryId } | undefined;
  Book: undefined;
  Bag: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ProductDetail: { productId: string };
  Search: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Menu: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  Appointments: undefined;
  Profile: undefined;
  Help: undefined;
  About: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
