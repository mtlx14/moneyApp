import { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { fS } from '../../../theme/theme.js';
import { cardMonth, confirmDelete, firstInstallmentIndex, monthIndexLabel, monthName } from '../../../helpers.js';
import { deleteCard, deleteCardPurchase, saveCard } from '../../../services.js';
import GoBackScroll from '../components/GoBackScroll.js';
import AccountCard, { CARD_RATIO, WIDE_CARD_ASPECT, WIDE_CARD_TOP } from '../components/AccountCard.js';
import FadingScroll from '../components/FadingScroll.js';
import SwipeToDelete from '../components/SwipeToDelete.js';
import Icon from '../components/Icon.js';
import ModalCard from '../components/ModalCard.js';
import ModalCardPurchase from '../components/ModalCardPurchase.js';

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const shortDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

// Una tarjeta de crédito abierta, armada como una cuenta con su historial: la
// tarjeta ancha arriba y la lista abajo. La lista no son movimientos sino las
// compras que pagan cuota en el mes que se mira en Gastos, cada una con el
// número de cuota que le toca; el monto de la tarjeta es la suma de esas
// cuotas. Se llega desde Gastos y el gesto de volver deja ahí
export default function CreditCard({ setShowMenu, navigate, nAnimations, params }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { cards, cardPurchases, categories } = useData();
  const { monthOffset } = useAppStorage();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // la compra abierta en el modal: con id se edita, sin id es nueva
  const [selected, setSelected] = useState(null);
  const [editingCard, setEditingCard] = useState(false);
  // página visible del scroll de abajo: 0 el mes que se mira, 1 el siguiente
  const [page, setPage] = useState(0);

  // la tarjeta abierta ocupa la pantalla entera, como una cuenta abierta
  useEffect(() => {
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  const card = cards.find((c) => c.id === params?.cardId);

  const handleGoBack = () => {
    if (selected) {
      setSelected(null);
      return true;
    }
    if (editingCard) {
      setEditingCard(false);
      return true;
    }
    return false;
  };

  // la lista arranca justo debajo de la tarjeta, con sus mismas medidas
  const listTop = windowHeight * WIDE_CARD_TOP + (windowWidth * CARD_RATIO) / WIDE_CARD_ASPECT;
  const barHeight = windowWidth * 0.14;
  const barBottom = insets.bottom + 10;
  const barSpace = barHeight + barBottom + 10;
  const listHeight = windowHeight - listTop - barSpace;

  // mientras llega la tarjeta (o si se borró) no hay nada que mostrar
  if (!card) return <GoBackScroll page='monthly_summary' entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} />;

  // el mes siguiente sale igual que este, corrido un mes: suma las compras que
  // empiezan y ya no cuenta las que terminan
  const months = [cardMonth({ card, purchases: cardPurchases, monthOffset }), cardMonth({ card, purchases: cardPurchases, monthOffset: monthOffset + 1 })];
  const total = months[0].total;
  const nextTotal = months[1].total;

  const purchaseRow = ({ purchase, installment }, isUpcoming) => {
    const category = categories[purchase.category];
    const installments = purchase.installments || 1;
    // lo de abajo dice en qué cuota va, o cuándo empieza si todavía no empezó
    const detail = isUpcoming ? `desde ${monthIndexLabel(firstInstallmentIndex(purchase, card))}` : installments === 1 ? '1/1' : `cuota ${installment}/${installments}`;

    return (
      <View key={purchase.id} style={{ opacity: isUpcoming ? 0.5 : 1 }}>
        <SwipeToDelete
          width={windowWidth * 0.9}
          height={windowWidth * 0.13}
          onDelete={({ reset }) => confirmDelete({ title: 'Eliminar compra', message: `¿Estás seguro que quieres eliminar "${purchase.label || 'esta compra'}"?`, onConfirm: () => deleteCardPurchase({ purchase }), onCancel: reset })}
        >
          <Pressable onPress={() => setSelected(purchase)} style={{ backgroundColor: theme.bg.tr_05, borderRadius: 10, height: '100%', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: windowWidth * 0.09, height: windowWidth * 0.09, borderRadius: 9, backgroundColor: category?.color || '#8A8378', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name={category?.icon || 'credit_card'} size={windowWidth * 0.05} color={theme.text.onFill} />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: theme.text._2, fontSize: fS.subsText }}>
                  {purchase.label || category?.label || 'Compra'}
                </Text>
                <Text style={{ color: theme.text._3, fontSize: fS.keyboardBtn * 0.8 }}>{[detail, shortDate(purchase.date)].filter(Boolean).join(' · ')}</Text>
              </View>
            </View>
            <Text style={{ color: theme.text.red, fontSize: fS.subsText }}>{`-$${Number(purchase.amount).toLocaleString('es-CL')}`}</Text>
          </Pressable>
        </SwipeToDelete>
      </View>
    );
  };

  return (
    <GoBackScroll page='monthly_summary' entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} onBack={handleGoBack} innerStep={!!selected || editingCard}>
      <View style={{ height: windowHeight, width: windowWidth }}>
        {!selected && !editingCard && (
          <>
            {/* el key la rearma al renombrarla: la tarjeta lee el nombre una sola vez */}
            <AccountCard key={card.name} amountValue={page === 0 ? total : nextTotal} account={{ id: card.id, name: card.name, type: 'card' }} wide note={page === 0 ? `Siguiente mes: $${nextTotal.toLocaleString('es-CL')}` : `Este mes: $${total.toLocaleString('es-CL')}`} />

            <Animated.View entering={FadeIn.duration(150)} style={{ position: 'absolute', left: 0, top: listTop, width: windowWidth, height: listHeight }}>
              {/* Como en Inicio: se desliza a la izquierda para ver el mes siguiente,
                  con sus cuotas y lo que suma. La tarjeta de arriba sigue a la
                  página que se ve */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={32}
                onScroll={(e) => {
                  const nextPage = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
                  if (nextPage !== page) setPage(nextPage);
                }}
              >
                {months.map(({ current, upcoming }, index) => (
                  // cada página con el alto entero: la lista de adentro scrollea contra ese alto
                  <View key={index} style={{ width: windowWidth, height: listHeight, paddingHorizontal: windowWidth * 0.05 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: theme.text._3, fontSize: fS.mSummarySubtitle }}>{monthName(monthOffset + index)}</Text>
                        {/* marcada como pagada en Gastos: la misma marca del check. Es
                            del mes que se mira, el siguiente todavía no se paga */}
                        {index === 0 && card.isPaid && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.bg.check, borderRadius: 100, paddingVertical: 4, paddingLeft: 8, paddingRight: 10 }}>
                            <Image source={require('../../../../assets/icons/check.png')} style={{ width: fS.keyboardBtn * 0.85, aspectRatio: 1 }} />
                            <Text style={{ color: theme.text.onFill, fontSize: fS.keyboardBtn * 0.85 }}>Pagado</Text>
                          </View>
                        )}
                      </View>
                      {/* los días de la tarjeta, que es lo que se edita de ella */}
                      <Pressable onPress={() => setEditingCard(true)} style={{ backgroundColor: theme.bg.tr_05, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12 }}>
                        <Text style={{ color: theme.text._3, fontSize: fS.keyboardBtn * 0.85 }}>{`Factura ${card.billingDay || 1} · Paga ${card.paymentDay || 1}`}</Text>
                      </Pressable>
                    </View>

                    {current.length === 0 && upcoming.length === 0 ? (
                      <Text style={{ color: theme.text._3, fontSize: fS.subsText, paddingVertical: 20 }}>Sin compras este mes.</Text>
                    ) : (
                      <FadingScroll>
                        <View style={{ gap: 5, paddingBottom: windowHeight * 0.02 }}>
                          {current.length === 0 && <Text style={{ color: theme.text._3, fontSize: fS.subsText, paddingVertical: 10 }}>Sin cuotas este mes.</Text>}
                          {current.map((row) => purchaseRow(row, false))}

                          {/* lo anotado que todavía no paga cuota: si no, una compra
                              recién hecha no se vería hasta el mes siguiente */}
                          {upcoming.length > 0 && (
                            <>
                              <Text style={{ color: theme.text._3, fontSize: fS.mSummarySubtitle, paddingTop: 12, paddingBottom: 4 }}>Todavía no empiezan</Text>
                              {upcoming.map((row) => purchaseRow(row, true))}
                            </>
                          )}
                        </View>
                      </FadingScroll>
                    )}
                  </View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* anotar una compra, fijo abajo como en las cuentas. Nace con la fecha de hoy */}
            <Animated.View entering={FadeIn.duration(150)} style={{ position: 'absolute', left: windowWidth * 0.05, bottom: barBottom }}>
              <Pressable onPress={() => setSelected({ cardId: card.id, label: '', amount: 0, installments: 1, date: new Date() })} style={{ width: windowWidth * 0.9, height: barHeight, borderRadius: 15, backgroundColor: theme.bg.tr_1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text._2, fontSize: barHeight * 0.45, fontWeight: '300', lineHeight: barHeight * 0.55 }}>+</Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {selected && <ModalCardPurchase purchase={selected} card={card} onCancel={() => setSelected(null)} />}

        {editingCard && (
          <ModalCard
            card={card}
            onCancel={() => setEditingCard(false)}
            onSave={(next) => {
              saveCard({ card: next });
              setEditingCard(false);
            }}
            onDelete={(toDelete) => {
              deleteCard({ card: toDelete, purchases: cardPurchases });
              navigate('monthly_summary', 0);
            }}
          />
        )}
      </View>
    </GoBackScroll>
  );
}
