import React from 'react';
import {
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from './types';
import TabBar from '../components/TabBar';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import BookScreen from '../screens/BookScreen';
import BagScreen from '../screens/BagScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import WishlistScreen from '../screens/WishlistScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MenuScreen from '../screens/MenuScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import AddressesScreen from '../screens/AddressesScreen';
import SignInScreen from '../screens/SignInScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.gold,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

// Deep links, e.g. rupsuhana://product/p1 or rupsuhana://orders
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['rupsuhana://'],
  config: {
    screens: {
      Tabs: {
        screens: { Home: 'home', Shop: 'shop', Book: 'book', Bag: 'bag' },
      },
      ProductDetail: 'product/:productId',
      Search: 'search',
      Wishlist: 'wishlist',
      Notifications: 'notifications',
      Menu: 'menu',
      Checkout: 'checkout',
      OrderSuccess: 'order-success/:orderId',
      Orders: 'orders',
      OrderDetail: 'order/:orderId',
      Appointments: 'appointments',
      Profile: 'profile',
      Help: 'help',
      About: 'about',
      Addresses: 'addresses',
      SignIn: 'sign-in',
      Register: 'register',
    },
  },
};

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Book" component={BookScreen} />
      <Tab.Screen name="Bag" component={BagScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={theme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ animation: 'slide_from_left' }}
        />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
