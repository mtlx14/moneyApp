import { View, Text, Dimensions, Pressable, Platform, Alert } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useData } from '../../context';
import { doc, setDoc } from 'firebase/firestore';
import db from '../../conection.js';
import { fS } from '../theme/theme.js';

export default function UnmarkButton({ billToUpdate }) {
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();
  const { bills } = useData();

  const handleOnPress = () => {
    if (billToUpdate === 'monthly_summary') {
      for (const bill of bills.filter((b) => b.type === 'fixed' || b.type === 'planned')) {
        if (bill.isPaid) {
          setDoc(
            doc(db, 'bills', bill.id),
            {
              isPaid: false,
            },
            {
              merge: true,
            },
          );
        }
      }
    } else if (billToUpdate === 'subs') {
      const totalOfSubs = bills.filter((b) => b.type === 'sub').reduce((a, b) => a + b.amount, 0);
      for (const bill of bills.filter((b) => b.type === 'sub')) {
        if (bill.isPaid) {
          setDoc(
            doc(db, 'bills', bill.id),
            {
              isPaid: false,
            },
            {
              merge: true,
            },
          );
        }
      }
      setDoc(
        doc(db, 'bills', bills.find((a) => a.label === 'Suscripciones').id),

        {
          amount: totalOfSubs,
        },
        {
          merge: true,
        },
      );
    }
  };
  const confirmationAction = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Estas seguro que quieres desmarcar todo?');
      if (ok) {
        handleOnPress();
      }
    } else {
      Alert.alert('Desmarcar todo', '¿Estas seguro que quieres desmarcar todo?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: () => handleOnPress() },
      ]);
    }
  };

  return (
    <Pressable onPress={() => confirmationAction()} style={{ backgroundColor: theme.bg.red, borderRadius: 50, alignSelf: 'flex-start', paddingHorizontal: windowWidth * 0.04, height: windowWidth * 0.09, justifyContent: 'center' }}>
      <Text style={{ color: theme.text._2, fontWeight: 500, fontSize: fS.unmarkBtn }}>Desmarcar todo</Text>
    </Pressable>
  );
}
