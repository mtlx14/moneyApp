import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard as RNKeyboard, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, FadeInDown, LinearTransition, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { useData } from '../../../../context';
import { TRANSFER_PAIR, TRANSFER_TYPES, TYPES_WITHOUT_CATEGORY, txTypes } from '../../../../data.js';
import { fS } from '../../../theme/theme.js';
import { addsToBalance, confirmDelete, isRideAccount, otherAccountType, rideCategories, txTypeLabel, userOfAccountType } from '../../../helpers.js';
import { deleteTransaction, notifyUserTransfer, saveTransaction } from '../../../services.js';
import Icon from './Icon.js';
import Caret from './Caret.js';
import { Keyboard as CustomKeyboard } from './Keyboard.js';
import DatePicker from './DatePicker.js';

const toDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const pad = (n) => String(n).padStart(2, '0');
// la fecha se lee dd-mm-yyyy
const shortDate = (date) => (date ? `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}` : '—');

// Detalle de un movimiento, con la misma caja de filas que el modal de gastos.
export default function ModalTransaction({ tx, onCancel, setShowMenu }) {
  // congeladas al montar: en web el teclado nativo achica window.innerHeight y
  // releerlas encogería el modal mientras se escribe
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const theme = useTheme();
  const { accounts, transactions, categories } = useData();

  const [draft, setDraft] = useState(() => ({ label: tx.label || '', amount: Number(tx.amount) || 0, type: tx.type, category: tx.category, accountId: tx.accountId, date: toDate(tx.date) }));

  // qué fila tiene la caja chica abierta: 'type' | 'account' | 'date' | null
  const [picking, setPicking] = useState(null);
  // se guarda aparte para que la caja conserve su tamaño mientras sale
  const [panelField, setPanelField] = useState(null);
  const [amountKeyboard, setAmountKeyboard] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // las descripciones ya escritas, cada una con el tipo y la categoría que la
  // acompañaron: elegir una rellena el juego completo. Se repiten mucho, así que
  // se agrupan por el trío y las más usadas quedan arriba. Los saldos iniciales
  // quedan fuera: hay uno por cuenta y nunca se vuelven a escribir
  const savedSets = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const label = (t.label || '').trim();
      if (!label || t.id === tx.id || t.type === 'initial') return;
      const key = `${label.toLowerCase()}|${t.type || ''}|${t.category || ''}`;
      const found = map.get(key);
      if (found) found.count += 1;
      else map.set(key, { key, label, type: t.type, category: t.category, count: 1 });
    });
    const sets = [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    // en la lista solo se lee la descripción: si un mismo texto tuvo dos juegos
    // distintos, las filas saldrían iguales. Se queda el juego más usado
    const byLabel = new Map();
    sets.forEach((set) => {
      const key = set.label.toLowerCase();
      if (!byLabel.has(key)) byLabel.set(key, set);
    });
    return [...byLabel.values()];
  }, [transactions, tx.id]);

  const query = draft.label.trim().toLowerCase();
  const matches = query ? savedSets.filter((set) => set.label.toLowerCase().includes(query)) : [];
  // mientras se escribe la descripción, la caja se queda con esa fila y la lista
  const showSuggestions = inputFocused && matches.length > 0;

  useEffect(() => {
    if (picking) setPanelField(picking);
  }, [picking]);

  // el menú estorba en el modal, se esconde mientras está abierto
  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  const openTimer = useRef(null);
  const blurTimer = useRef(null);
  // el navegador suelta el foco del input antes de que corra el onPress, así que
  // el estado del teclado nativo se recuerda en vez de mirar activeElement
  const focusState = useRef({ focused: false, blurredAt: 0 });
  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(blurTimer.current);
    },
    [],
  );

  const dismissSystemKeyboard = () => {
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else RNKeyboard.dismiss();
  };

  const systemKeyboardOpen = () => {
    if (Platform.OS !== 'web') return RNKeyboard.isVisible();
    const { focused, blurredAt } = focusState.current;
    return focused || Date.now() - blurredAt < 400;
  };

  const inputFocusProps = {
    onFocus: () => {
      focusState.current = { focused: true, blurredAt: 0 };
      clearTimeout(blurTimer.current);
      setInputFocused(true);
      // no pueden convivir el teclado nativo, el custom y las cajas chicas
      clearTimeout(openTimer.current);
      setAmountKeyboard(false);
      setPicking(null);
    },
    onBlur: () => {
      focusState.current = { focused: false, blurredAt: Date.now() };
      // el foco se suelta antes de que corra el toque sobre una sugerencia: la
      // lista se queda un momento más para alcanzar a recibirlo
      clearTimeout(blurTimer.current);
      blurTimer.current = setTimeout(() => setInputFocused(false), 150);
    },
  };

  const openAmountKeyboard = () => {
    clearTimeout(openTimer.current);
    setPicking(null);
    const wasOpen = systemKeyboardOpen();
    dismissSystemKeyboard();
    // el teclado nativo tarda en cerrarse, si montamos el custom antes queda mal puesto
    if (wasOpen) openTimer.current = setTimeout(() => setAmountKeyboard(true), 400);
    else setAmountKeyboard(true);
  };

  // Con transferencia las cuentas son dos y ya están puestas: tocar cualquiera de
  // las dos filas las intercambia en el lugar, sin caja chica que elegir.
  const swapTransferAccounts = () => {
    if (!transferPartner) return;
    setDraft((prev) => ({ ...prev, accountId: transferPartner.id, toAccountId: prev.accountId }));
  };

  const isTransferAccountRow = (field) => draft.type === 'transfer' && (field === 'account' || field === 'toAccount');

  // las filas que abren una caja chica: el destino solo cuando se elige, que es
  // en la transferencia al otro usuario
  const canPick = (field) => ['type', 'account', 'category', 'date'].includes(field) || (field === 'toAccount' && draft.type === 'user_transfer');

  const openPicker = (field) => {
    clearTimeout(openTimer.current);
    setAmountKeyboard(false);
    dismissSystemKeyboard();
    setPicking((prev) => (prev === field ? null : field));
  };

  const closeAll = () => {
    clearTimeout(openTimer.current);
    setAmountKeyboard(false);
    setPicking(null);
    dismissSystemKeyboard();
  };

  // una descripción guardada se trae consigo su tipo y su categoría
  const pickSet = (set) => {
    clearTimeout(blurTimer.current);
    setDraft((prev) => ({ ...prev, label: set.label, type: set.type ?? prev.type, category: set.category ?? prev.category }));
    dismissSystemKeyboard();
    setInputFocused(false);
  };

  // Al que recibe una transferencia le queda el aviso anotado: no está mirando
  // la app cuando se anota. Solo al crearla, editarla no vuelve a avisar
  const notifyReceiver = () => {
    if (tx.id || draft.type !== 'user_transfer') return;
    const to = accounts.find((a) => a.id === draft.toAccountId);
    const toUser = userOfAccountType(to?.type)?.name;
    if (!toUser) return;
    notifyUserTransfer({ toUser, from: userOfAccountType(originOwner)?.label || '', amount: Number(draft.amount), accountName: to.name });
  };

  // el tipo que impone una categoría, si es exclusiva de uno; null si sirve para
  // los dos y entonces el tipo elegido se respeta
  const typeForCategory = (key) => {
    const kind = categories[key]?.kind;
    return kind === 'income' || kind === 'expense' ? kind : null;
  };

  // el botón de guardar aparece cuando el movimiento está entero y además
  // cambió, igual que en el modal de gastos. La categoría solo se pide en los
  // tipos que la llevan
  const isComplete = !!draft.label.trim() && Number(draft.amount) > 0 && !!draft.type && !!draft.accountId && !!draft.date && (TYPES_WITHOUT_CATEGORY.includes(draft.type) || !!draft.category) && (!TRANSFER_TYPES.includes(draft.type) || !!draft.toAccountId);
  const hasChanges =
    !tx.id ||
    draft.label.trim() !== (tx.label || '').trim() ||
    Number(draft.amount) !== Number(tx.amount || 0) ||
    draft.type !== tx.type ||
    draft.category !== tx.category ||
    draft.accountId !== tx.accountId ||
    draft.toAccountId !== tx.toAccountId ||
    draft.date?.getTime() !== toDate(tx.date)?.getTime();

  // hay algo abierto encima del modal: un toque fuera solo cierra eso
  const somethingOpen = amountKeyboard || inputFocused || !!picking;

  const account = accounts.find((a) => a.id === draft.accountId);
  const category = categories[draft.category];
  // saldo inicial e ingreso suman, el resto resta
  const isPositive = addsToBalance(draft);

  // el saldo inicial es uno solo por cuenta: si ya existe, no se ofrece
  const hasInitial = transactions.some((t) => t.accountId === draft.accountId && t.type === 'initial' && t.id !== tx.id);

  // el dueño de una cuenta: las sub-cuentas lo heredan de la cuenta que las
  // contiene, que es la que lleva el tipo
  const ownerOf = (a) => (a?.type === 'sub_account' ? accounts.find((p) => p.id === a.forAccount)?.type : a?.type);
  const originOwner = ownerOf(account);

  // El destino de una transferencia no se elige: va entre la cuenta corriente y
  // el efectivo del mismo dueño, así que es la otra del par. Nunca entre
  // usuarios, nunca una sub-cuenta —esas se mueven con su propio traspaso— y
  // nunca Bencina, los sueldos o los contenedores, que llevan el saldo escrito a
  // mano y no se moverían con un movimiento
  const partnerName = TRANSFER_PAIR.includes(account?.name) ? TRANSFER_PAIR.find((name) => name !== account.name) : null;
  const transferPartner = partnerName ? accounts.find((a) => a.name === partnerName && a.isLedger && a.type !== 'sub_account' && ownerOf(a) === originOwner) : null;

  // La transferencia al otro usuario llega solo a su cuenta corriente o a su
  // efectivo: las de transporte solo llevan ingresos y las que tienen el saldo
  // escrito a mano no se mueven con un movimiento. El otro sale del dueño de la
  // cuenta de origen, no de quién esté usando la app: cada uno transfiere desde
  // sus cuentas
  const otherOwner = otherAccountType(originOwner);
  const otherUserLabel = userOfAccountType(otherOwner)?.label;
  const otherAccounts = accounts.filter((a) => a.type === otherOwner && a.isLedger && a.type !== 'sub_account' && TRANSFER_PAIR.includes(a.name));
  const toAccount = accounts.find((a) => a.id === draft.toAccountId);

  // Al elegir el tipo, la transferencia al otro usuario ya viene escrita: de
  // cuenta corriente a cuenta corriente y con la descripción puesta. Todo se
  // puede cambiar después, y una descripción ya escrita no se pisa
  const userTransferDefaults = (prev) => ({
    accountId: accounts.find((a) => a.type === originOwner && a.isLedger && a.name === TRANSFER_PAIR[0])?.id || prev.accountId,
    toAccountId: otherAccounts.find((a) => a.name === TRANSFER_PAIR[0])?.id,
    label: prev.label.trim() ? prev.label : `Transferencia para ${otherUserLabel}`,
  });

  // Por pagar y Currently son lo que dejó cada app de transporte: ahí todo es
  // ingreso, así que no se ofrece ningún otro tipo (ver RIDE_ACCOUNTS)
  const rideAccount = isRideAccount(account);

  // sin par no hay a dónde transferir: el tipo ni se ofrece
  const canTransfer = !!account?.isLedger && account.type !== 'sub_account' && !!transferPartner;
  // sale de la cuenta corriente o del efectivo propios y llega a los del otro:
  // en las demás cuentas el tipo ni se ofrece
  const canUserTransfer = !!account?.isLedger && account.type !== 'sub_account' && TRANSFER_PAIR.includes(account.name) && otherAccounts.length > 0;
  const typeOptions = Object.entries(txTypes)
    .filter(([key]) => key !== draft.type && !(key === 'initial' && hasInitial) && !(key === 'transfer' && !canTransfer) && !(key === 'user_transfer' && !canUserTransfer) && !(rideAccount && key !== 'income'))
    .map(([key, type]) => ({ key, label: txTypeLabel(key, otherUserLabel), icon: type }));

  const otherAccountOptions = otherAccounts.map((a) => ({ key: a.id, label: a.name }));

  // las cuentas del mismo dueño, sin la que ya tiene el movimiento. Solo las de
  // ledger: Bencina y los sueldos llevan el saldo escrito a mano, un movimiento
  // ahí no movería nada. En la transferencia al otro usuario las dos puntas son
  // cuenta corriente o efectivo, así que la de salida también se limita a esas
  const accountOptions = accounts.filter((a) => a.type === account?.type && a.isLedger && a.id !== draft.accountId && (draft.type !== 'user_transfer' || TRANSFER_PAIR.includes(a.name))).map((a) => ({ key: a.id, label: a.name }));

  // una cuenta de transporte solo lleva ingresos: si el movimiento llega con
  // otro tipo (el swipe de gasto, o se cambió la cuenta) se corrige solo, y la
  // categoría que no sea de transporte se suelta
  useEffect(() => {
    if (!rideAccount) return;
    const allowed = rideCategories(categories).map(([key]) => key);
    if (draft.type !== 'income' || (draft.category && !allowed.includes(draft.category))) {
      setDraft((prev) => ({ ...prev, type: 'income', category: allowed.includes(prev.category) ? prev.category : undefined, toAccountId: undefined }));
    }
  }, [rideAccount, draft.type, draft.category, categories]);

  // el destino de la transferencia se pone solo, y se rehace si cambia la cuenta
  // de origen
  useEffect(() => {
    if (draft.type !== 'transfer') return;
    if (draft.toAccountId !== transferPartner?.id) setDraft((prev) => ({ ...prev, toAccountId: transferPartner?.id }));
  }, [draft.type, draft.accountId, transferPartner?.id]);

  // las categorías que sirven para este tipo: un ingreso no ofrece las de gasto
  // y al revés. Las de kind 'both' salen siempre. Mientras no haya tipo elegido
  // no hay con qué filtrar, así que salen todas
  // En las cuentas de transporte la lista es solo Uber, Didi y Cabify, en ese
  // orden: son las que se ven adentro de la cuenta en el listado
  const kindForType = draft.type === 'income' ? 'income' : draft.type === 'expense' ? 'expense' : null;
  const categoryOptions = rideAccount
    ? rideCategories(categories)
        .filter(([key]) => key !== draft.category)
        .map(([key, c]) => ({ key, label: c.label, icon: c }))
    : Object.entries(categories)
        .filter(([key, c]) => key !== draft.category && (!kindForType || c.kind === 'both' || c.kind === kindForType))
        .map(([key, c]) => ({ key, label: c.label, icon: c, order: c.order ?? 0 }))
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  const rows = [
    { field: 'label', label: 'Descripción' },
    { field: 'amount', label: 'Monto' },
    { field: 'type', label: 'Tipo', value: draft.type ? txTypeLabel(draft.type, otherUserLabel) : '—', icon: txTypes[draft.type] },
    // saldos iniciales, transferencias y ajustes no llevan categoría: la fila no aparece
    ...(TYPES_WITHOUT_CATEGORY.includes(draft.type) ? [] : [{ field: 'category', label: 'Categoría', value: category?.label || draft.category || '—', icon: category }]),
    { field: 'account', label: 'Cuenta', value: account?.name || draft.accountId },
    // las dos transferencias necesitan saber a dónde van; los demás tipos no. La
    // de siempre ya tiene su par puesto, la del otro usuario se elige
    ...(TRANSFER_TYPES.includes(draft.type) ? [{ field: 'toAccount', label: 'A cuenta', value: (draft.type === 'transfer' ? transferPartner?.name : toAccount?.name) || '—' }] : []),
    { field: 'date', label: 'Fecha', value: shortDate(draft.date) },
  ];

  // al sugerir, el resto de las filas le deja su espacio a la lista
  const visibleRows = showSuggestions ? rows.filter((row) => row.field === 'label') : rows;

  const rowHeight = windowWidth * 0.12;
  const gap = 10;
  const edge = 20;
  const boxHeight = rows.length * rowHeight + (rows.length - 1);

  // las cuentas y las categorías tienen nombres más largos que los tipos
  const panelWidth = panelField === 'type' ? windowWidth * 0.36 : windowWidth * 0.44;

  const panelOptions = panelField === 'account' ? accountOptions : panelField === 'toAccount' ? otherAccountOptions : panelField === 'category' ? categoryOptions : panelField === 'type' ? typeOptions : [];
  // las categorías pueden ser muchas: la caja chica nunca pasa de la grande y lo
  // que sobra scrollea adentro
  const panelHeight = Math.min(panelOptions.length * rowHeight + Math.max(0, panelOptions.length - 1), boxHeight);
  // arranca a la altura de su fila y crece hacia abajo; cuando ya no entra, se
  // apoya en el borde de abajo de la caja grande y sigue creciendo hacia arriba.
  // Nunca cuelga más abajo que el modal
  const panelRow = rows.findIndex((row) => row.field === panelField);
  const panelTop = Math.max(0, Math.min(panelRow > 0 ? panelRow * (rowHeight + 1) : 0, boxHeight - panelHeight));

  // la caja chica queda entera, a 20px del borde derecho: el conjunto se corre
  // lo que haga falta para eso
  const shift = windowWidth * 0.9 + gap + panelWidth - (windowWidth - edge);
  // La caja chica no viaja desde fuera de la pantalla: se funde desde la derecha
  // y se va fundiéndose hacia la derecha, corriendo los mismos 25px que los
  // presets FadeInRight/FadeOutRight. Las dos animaciones comparten duración
  // para que la caja grande y la chica lleguen juntas
  const panelTravel = 25;
  const duration = 180;
  const shiftProgress = useSharedValue(0);
  const panelProgress = useSharedValue(0);

  useEffect(() => {
    // la fecha no corre la caja grande: su selector sale abajo, como el teclado
    const to = picking && picking !== 'date' ? 1 : 0;
    shiftProgress.value = withTiming(to, { duration, easing: Easing.out(Easing.quad) });
    panelProgress.value = withTiming(to, { duration, easing: Easing.out(Easing.quad) });
  }, [picking]);

  const shiftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -shift * shiftProgress.value }] }));

  const panelStyle = useAnimatedStyle(() => ({ opacity: panelProgress.value, transform: [{ translateX: (1 - panelProgress.value) * panelTravel }] }));

  // el alto de la caja cerrada, para clavar el borde de arriba donde quedaría
  // centrada y que el desplegable crezca solo hacia abajo
  const closedHeight = boxHeight + 10 + windowWidth * 0.08;
  const topOffset = (windowHeight * 0.6 - closedHeight) / 2;

  // la pastilla de color con el ícono, igual en las filas y en las opciones
  const iconBadge = (icon) =>
    !!icon?.icon && (
      <View style={{ width: windowWidth * 0.07, height: windowWidth * 0.07, borderRadius: 7, backgroundColor: icon.color, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={icon.icon} size={windowWidth * 0.04} color={theme.text.onFill} />
      </View>
    );

  // el alto lo pone la caja de afuera (nunca más que la grande) y el recorte lo
  // hace ella: un borderRadius sobre el ScrollView no clipea sus hijos
  const pickList = (options, onPick) => (
    <View style={{ height: panelHeight, borderRadius: 20, overflow: 'hidden' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map((option, index) => (
          <View key={option.key}>
            {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
            <Pressable onPress={() => (onPick(option.key), setPicking(null))} style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 15 }}>
              {iconBadge(option.icon)}
              <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                {option.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(150)} style={{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }}>
      {/* un toque fuera de la caja cierra lo que esté abierto y, si no hay nada, el modal */}
      <Pressable onPress={() => (somethingOpen ? closeAll() : onCancel())} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />

      <Animated.View layout={LinearTransition} entering={FadeInDown.delay(150)} style={{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'flex-start', alignItems: 'center', paddingTop: topOffset }} pointerEvents='box-none'>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-start' }, shiftStyle]}>
          <View style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
            {visibleRows.map((row, index) => (
              <View key={row.field}>
                {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
                <View style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ backgroundColor: theme.bg.tr_05, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '35%' }}>
                    <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${row.label}:`}</Text>
                  </View>

                  {/* la descripción se escribe con el teclado del sistema */}
                  {row.field === 'label' ? (
                    <TextInput
                      {...inputFocusProps}
                      value={draft.label}
                      onChangeText={(text) => setDraft((prev) => ({ ...prev, label: text }))}
                      keyboardAppearance='dark'
                      style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10, flex: 1, height: '100%' }}
                    />
                  ) : row.field === 'amount' ? (
                    // el monto usa el teclado numérico de la app
                    <Pressable onPress={openAmountKeyboard} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                      <Text style={{ color: isPositive ? theme.text.green : theme.text.red, fontSize: fS.modalTransfer }}>{`${isPositive ? '+' : '-'}$${Number(draft.amount).toLocaleString('es-CL')}`}</Text>
                      {amountKeyboard && <Caret height={fS.modalTransfer * 1.2} />}
                    </Pressable>
                  ) : (
                    <Pressable
                      disabled={!canPick(row.field) && !isTransferAccountRow(row.field)}
                      onPress={() => (isTransferAccountRow(row.field) ? swapTransferAccounts() : openPicker(row.field))}
                      style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 }}
                    >
                      {iconBadge(row.icon)}
                      <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                        {row.value}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {/* lo que se guardó antes con esa descripción: al tocarla se rellena
                el juego entero. La caja no cambia de tamaño, la lista ocupa lo
                que dejaron las filas escondidas */}
            {showSuggestions && (
              <>
                <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />
                <ScrollView keyboardShouldPersistTaps='handled' style={{ height: boxHeight - rowHeight - 1, backgroundColor: theme.bg.tr_05 }}>
                  {matches.map((set, index) => (
                    <View key={set.key}>
                      {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
                      {/* onPressIn: en web el input pierde el foco antes del onPress */}
                      <Pressable onPressIn={() => pickSet(set)} style={{ height: rowHeight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15 }}>
                        {/* las pastillas del tipo y de la categoría que se van a
                            rellenar con la descripción: se ve qué trae cada una */}
                        {iconBadge(txTypes[set.type])}
                        {iconBadge(categories[set.category])}
                        <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                          {set.label}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            {/* con una lista abierta, un toque en cualquier fila de la caja
                grande solo la cierra: no abre la lista de esa fila ni el
                teclado. Va encima de las filas, tapándolas */}
            {!!picking && <Pressable onPress={() => setPicking(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
          </View>

          {/* caja chica al costado: entera, solo se funde. La opción actual no se
              repite, ya se lee en la fila */}
          <Animated.View pointerEvents={picking && picking !== 'date' ? 'auto' : 'none'} style={[{ position: 'absolute', left: windowWidth * 0.8 + gap, top: panelTop, width: panelWidth }, panelStyle]}>
            {/* al cambiar el tipo, la categoría que hubiera se suelta: puede no
                corresponder al tipo nuevo y quedaría escrita una mezcla */}
            {panelField === 'type' && pickList(typeOptions, (key) => setDraft((prev) => ({ ...prev, type: key, category: undefined, toAccountId: key === 'transfer' ? prev.toAccountId : undefined, ...(key === 'user_transfer' ? userTransferDefaults(prev) : {}) })))}
            {/* al cambiar la cuenta de origen el destino se suelta: podría ser la
                misma cuenta, o una de otro dueño */}
            {panelField === 'account' && pickList(accountOptions, (key) => setDraft((prev) => ({ ...prev, accountId: key, toAccountId: undefined })))}
            {/* y al revés: una categoría que es solo de gasto o solo de ingreso
                arrastra el tipo con ella. Las de kind 'both' lo dejan como está */}
            {/* el destino de la transferencia al otro usuario: sus dos cuentas */}
            {panelField === 'toAccount' && pickList(otherAccountOptions, (key) => setDraft((prev) => ({ ...prev, toAccountId: key })))}
            {panelField === 'category' && pickList(categoryOptions, (key) => setDraft((prev) => ({ ...prev, category: key, type: typeForCategory(key) || prev.type })))}
          </Animated.View>
        </Animated.View>

        {/* los botones quedan fuera del modal: con algo abierto encima no reciben
            el toque, se lo lleva el escudo de atrás y solo cierra eso */}
        <Animated.View layout={LinearTransition} pointerEvents={somethingOpen ? 'none' : 'auto'} style={{ width: windowWidth * 0.8, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* eliminar, a la izquierda y separado de los otros dos, como en el
              modal de gastos. Solo en un movimiento que ya existe */}
          {!!tx.id && (
            <Animated.View layout={LinearTransition}>
              <Pressable
                onPress={() => confirmDelete({ title: 'Eliminar movimiento', message: `¿Estás seguro que quieres eliminar "${draft.label.trim() || 'este movimiento'}"?`, onConfirm: () => (deleteTransaction({ tx }), onCancel()) })}
                style={{ backgroundColor: theme.bg.danger, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}
              >
                <Icon name='delete' size={windowWidth * 0.045} color={theme.text.onFill} />
              </Pressable>
            </Animated.View>
          )}

          <View style={{ flex: 1 }} />

          <Animated.View layout={LinearTransition}>
            <Pressable onPress={onCancel} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cerrar</Text>
            </Pressable>
          </Animated.View>

          {/* guardar aparece solo cuando hay algo entero que guardar */}
          {isComplete && hasChanges && (
            <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
              <Pressable onPress={() => (saveTransaction({ tx: { ...draft, id: tx.id } }), notifyReceiver(), onCancel())} style={{ backgroundColor: theme.bg.check, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                {/* onFill y no _1: el modal de gastos usa _1, que en v1 era blanco
                    y en v2 quedó tinta sobre el verde */}
                <Text style={{ color: theme.text.onFill, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Guardar</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {/* teclado personalizado para el monto ------------------------------------ */}
      {amountKeyboard && (
        <CustomKeyboard
          initialValue={draft.amount ? String(draft.amount) : '0'}
          onChange={(nextValue) => setDraft((prev) => ({ ...prev, amount: Number(nextValue) }))}
          onConfirm={(nextValue) => {
            setDraft((prev) => ({ ...prev, amount: Number(nextValue) }));
            setAmountKeyboard(false);
          }}
        />
      )}

      {/* selector de fecha, en la misma caja de abajo que el teclado ------------- */}
      {picking === 'date' && (
        <DatePicker
          value={draft.date}
          onChange={(date) => setDraft((prev) => ({ ...prev, date }))}
          onConfirm={(date) => {
            setDraft((prev) => ({ ...prev, date }));
            setPicking(null);
          }}
        />
      )}
    </Animated.View>
  );
}
