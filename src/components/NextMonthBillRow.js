import { Dimensions, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { fS } from '../theme/theme';
import AnimatedSwapTextS from './AnimatedSwapTextS';
import CollapsibleRow from './CollapsibleRow';
import { amountForMonth, currentInstallment } from '../helpers';

// fila del mes siguiente: se abre o cierra según si el gasto entra en ese mes
export default function NextMonthBillRow({ bill, included, monthOffset }) {
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();

  return (
    <CollapsibleRow open={included}>
      <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
        <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{`${bill.emoji}   ${bill.label} ${bill.inMonths > 0 && bill.firstMonth ? currentInstallment(bill.firstMonth, monthOffset) + 1 + '/' + bill.inMonths : ''}`}</Text>

        <AnimatedSwapTextS type={'debt'} value={amountForMonth(bill, monthOffset + 1)} />
      </View>
    </CollapsibleRow>
  );
}
