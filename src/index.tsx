import React from 'react';
import { NativeModules, Platform } from 'react-native';
import { Button } from '@react-native-material/core';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { Wallet } from '@ethersproject/wallet';
import { pay } from './payer';

const LINKING_ERROR =
  `The package 'passport-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const PassportSdk = NativeModules.PassportSdåk
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
  amount: string | undefined;
  reference: string | undefined;
  target: string | undefined;
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
      return { reference: 'tag not found', target: '', amount: '' };
    }
    let payload = decodeArray(tag.ndefMessage[0].payload).split(':');
    let res = {
      amount: payload[1],
      reference: payload[2],
      target: payload[3],
    };
    return res;
  } catch (ex) {
    console.warn('Oops!', ex);
  } finally {
    // stop the nfc scanning
    NfcManager.cancelTechnologyRequest();
  }

  return { reference: 'tag not found', target: '', amount: '' };
}

export async function SubmitPayment(
  owner: Wallet,
  payment: Payment,
  contract: ethers.Contract
): Promise<string | undefined> {
  try {
    if (payment.target === undefined || payment.amount === undefined) {
      return Promise.reject('Payment is undefined');
    }
    let res = await pay(payment.target, payment.amount, owner, contract, {
      withPM: true,
      dryRun: false,
    });
    console.log(
      `Successfully spent $${payment.amount} at ${payment.reference}`
    );
    return Promise.resolve(res);
  } catch (ex) {
    console.warn('Oops!', ex);
  }
  return Promise.reject('Payment failed');
}

export async function InitiListener() {
  try {
    NfcManager.start();
    console.log('start OK');
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
