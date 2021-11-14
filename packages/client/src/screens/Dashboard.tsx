import { Hidden } from 'native-base';
import React from 'react';
import { Logo } from '../components';

export default function Dashboard() {
  return (
    <>
      <Hidden till="md">
        <Logo />
      </Hidden>
    </>
  );
}
