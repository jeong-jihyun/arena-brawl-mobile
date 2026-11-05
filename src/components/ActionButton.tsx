import React from 'react';
import {Pressable,StyleSheet,Text} from 'react-native';
type Props={label:string;color:string;size?:number;onPressIn?:()=>void;onPressOut?:()=>void;onPress?:()=>void;disabled?:boolean};
export function ActionButton({label,color,size=76,onPressIn,onPressOut,onPress,disabled}:Props){return <Pressable disabled={disabled} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={({pressed})=>[s.button,{width:size,height:size,borderRadius:size/2,backgroundColor:color,opacity:disabled?0.45:pressed?0.78:1}]}><Text style={s.label}>{label}</Text></Pressable>;}
const s=StyleSheet.create({button:{borderWidth:3,borderColor:'#ffffffcc',alignItems:'center',justifyContent:'center',elevation:6},label:{color:'#fff',fontWeight:'900',fontSize:14}});