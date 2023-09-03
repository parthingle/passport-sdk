import React from 'react';
import { NativeModules, Platform, Alert } from 'react-native';
import { Button } from '@react-native-material/core';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

const LINKING_ERROR =
  `The package 'passport-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const PassportSdk = NativeModules.PassportSdk
  ? NativeModules.PassportSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return PassportSdk.multiply(a, b);
}

export function Blob() {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Button title="Click Me" style={{ alignSelf: 'center', marginTop: 40 }} />
  );
}

interface Payment {
  reference: string;
}

export async function Init() {
  await NfcManager.requestTechnology(NfcTech.Ndef);
}

export async function ListenForTag(): Promise<Payment> {
  try {
    // register for the NFC tag with NDEF in it
    await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.MifareIOS]);
    // the resolved tag object will contain `ndefMessage` property
    const tag = await NfcManager.getTag();
    if (
      !tag ||
      !tag.ndefMessage ||
      !tag.ndefMessage.length ||
      !tag.ndefMessage[0]
    ) {
      return { reference: 'tag not found' };
    }

    console.warn('Tag found', tag.ndefMessage[0].payload);
    return { reference: decodeArray(tag.ndefMessage[0].payload) };
  } catch (ex) {
    console.warn('Oops!', ex);
  } finally {
    // stop the nfc scanning
    NfcManager.cancelTechnologyRequest();
  }

  return { reference: 'tag not found' };
}

export async function InitiListener() {
  try {
    const nfc = NfcManager.start();
    console.log('start OK', nfc);
  } catch (e) {
    console.warn('start fail', e);
  }
}

function decodeArray(intArray: any[]): string {
  let decoded = '';
  for (let i = 0; i < intArray.length; i++) {
    if (i === 0 && intArray[i] === 2) {
      continue;
    }
    if (i === 1 && intArray[i] === 101) {
      continue;
    }
    if (i === 2 && intArray[i] === 110) {
      continue;
    }
    decoded += String.fromCharCode(intArray[i]);
  }
  return decoded;
}
