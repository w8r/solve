import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Routes as AppRoutes } from './AppRoutes';

const AuthNavigator = createStackNavigator<AppRoutes>();
