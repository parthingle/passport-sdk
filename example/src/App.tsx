/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

import { StyleSheet, View, Alert } from 'react-native';
import { Balance } from './Components/Balance';
import { InitiListener, ListenForTag } from 'passport-sdk';
import { Button } from '@react-native-material/core';

export default function App() {


  React.useEffect(() => {
    async function init() {
      await InitiListener();
    }
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Balance />

      <Button
        title="Scan for Payment"
        style={{ alignSelf: 'center', marginTop: 40 }}
        onPress={() => {
          ListenForTag().then((payment) => {
            Alert.alert('Payment', parsePayment(payment.reference), [
              {
                text: 'Confirm',
                onPress: () => console.log('Confirm Pressed'),
              },
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ]);
          });
        }}
      />
    </View>
  );
}

function parsePayment(payment: string): string {
  let parts = payment.split(':');
  return 'Confirm payment of ' + parts[1] + ' at ' + parts[2];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
