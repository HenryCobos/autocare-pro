/**
 * Pantalla de Onboarding - Primera experiencia del usuario
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import AsyncStorageService from '../services/AsyncStorageService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTikTok } from '../hooks/useTracking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
  onComplete?: () => void;
}

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  features?: string[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'car-sport',
    title: '¡Bienvenido a AutoCare Pro!',
    description: 'La forma más inteligente de cuidar tus vehículos',
    color: Colors.primary,
    features: [
      '📅 Programa mantenimientos preventivos',
      '💰 Controla todos tus gastos',
      '🔔 Recibe recordatorios automáticos',
      '📊 Visualiza estadísticas detalladas',
    ],
  },
  {
    id: '2',
    icon: 'notifications',
    title: 'Nunca Olvides un Mantenimiento',
    description: 'Recordatorios inteligentes para cada servicio',
    color: Colors.success,
    features: [
      '⏰ Alertas antes de cada servicio',
      '📱 Notificaciones personalizables',
      '🔧 Historial completo de mantenimientos',
      '📈 Seguimiento de kilometraje',
    ],
  },
  {
    id: '3',
    icon: 'stats-chart',
    title: 'Control Total de Gastos',
    description: 'Analiza y optimiza tus costos vehiculares',
    color: Colors.warning,
    features: [
      '💵 Registra cada gasto fácilmente',
      '📊 Gráficas y reportes detalladas',
      '🏷️ Categorías personalizables',
      '📤 Exporta a PDF (Pro)',
    ],
  },
  {
    id: '4',
    icon: 'rocket',
    title: '¿Cuántos Vehículos Tienes?',
    description: 'Elige el plan perfecto para ti',
    color: Colors.info,
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation, onComplete }) => {
  const { trackCompleteTutorial } = useTikTok();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVehicleCount, setSelectedVehicleCount] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  // Opciones de vehículos
  const vehicleOptions = [
    { count: 1, label: '1 vehículo', plan: 'Free', icon: '🚗' },
    { count: 2, label: '2-3 vehículos', plan: 'Pro', icon: '🚗🚙' },
    { count: 3, label: '4+ vehículos', plan: 'Premium', icon: '🚗🚙🚕' },
  ];

  // Avanzar al siguiente slide
  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Saltar onboarding
  const handleSkip = async () => {
    await completeOnboarding('free');
  };

  // Completar onboarding
  const completeOnboarding = async (planType: 'free' | 'pro' | 'premium') => {
    try {
      // Marcar onboarding como completado
      await AsyncStorageService.setOnboardingCompleted(true);
      
      // Trackear completación del tutorial en TikTok
      await trackCompleteTutorial({
        content_id: planType,
        quantity: selectedVehicleCount ?? undefined,
      });
      
      // Si se seleccionó Pro o Premium, navegar al paywall
      if (planType === 'pro' || planType === 'premium') {
        console.log('OnboardingScreen - Navegando a Paywall con recommendedPlan:', planType);
        navigation.replace('Paywall', {
          source: 'onboarding',
          recommendedPlan: planType,
        });
      } else {
        // Si eligió Free, ir directamente a la app
        if (onComplete) {
          onComplete();
        } else {
          navigation.replace('MainTabs');
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // En caso de error, igual navegar a la app
      if (onComplete) {
        onComplete();
      } else {
        navigation.replace('MainTabs');
      }
    }
  };

  // Ir al paywall para aprovechar prueba gratis
  const handleStartTrial = async () => {
    let recommendedPlan: 'pro' | 'premium' = 'pro';

    if (selectedVehicleCount === 3) {
      recommendedPlan = 'premium';
    }

    try {
      await AsyncStorageService.setOnboardingCompleted(true);
      await trackCompleteTutorial({
        content_id: recommendedPlan,
        quantity: selectedVehicleCount ?? undefined,
      });
    } catch (error) {
      console.error('Error preparing trial flow from onboarding:', error);
    } finally {
      navigation.replace('Paywall', {
        source: 'onboarding',
        recommendedPlan,
      });
    }
  };

  // Manejar selección de plan
  const handleSelectVehicleCount = async (count: number) => {
    setSelectedVehicleCount(count);
    
    // Determinar el plan recomendado
    let planType: 'free' | 'pro' | 'premium' = 'free';
    if (count === 3) planType = 'premium';
    else if (count === 2) planType = 'pro';
    
    // Log para debug
    console.log('OnboardingScreen - Seleccionó count:', count, '→ planType:', planType);
    
    // Pequeño delay para feedback visual
    setTimeout(() => {
      completeOnboarding(planType);
    }, 300);
  };

  // Renderizar slide
  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isLastSlideItem = index === ONBOARDING_SLIDES.length - 1;

    return (
      <View style={styles.slide}>
        <ScrollView 
          style={styles.slideScrollView}
          contentContainerStyle={styles.slideContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Icono principal */}
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={80} color={item.color} />
          </View>

          {/* Título y descripción */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Características o opciones de vehículos */}
          {item.features && (
            <View style={styles.featuresContainer}>
              {item.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Selector de vehículos en el último slide */}
          {isLastSlideItem && (
            <View style={styles.vehicleOptionsContainer}>
              {vehicleOptions.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.vehicleOption,
                    selectedVehicleCount === option.count && styles.vehicleOptionSelected,
                  ]}
                  onPress={() => handleSelectVehicleCount(option.count)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.vehicleOptionIcon}>{option.icon}</Text>
                  <Text style={styles.vehicleOptionLabel}>{option.label}</Text>
                  <Text style={styles.vehicleOptionPlan}>
                    Plan {option.plan === 'Free' ? 'Gratuito' : option.plan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Renderizar indicadores de página
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { width: dotWidth, opacity },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con botón Skip */}
      {!isLastSlide && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Saltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer con paginación y botones */}
      <View style={styles.footer}>
        {renderPagination()}

        {!isLastSlide ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.startTrialButton} onPress={handleStartTrial}>
              <Text style={styles.startTrialButtonText}>🎁 Probar 3 Días Gratis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueFreeButton}
              onPress={() => completeOnboarding('free')}
            >
              <Text style={styles.continueFreeButtonText}>Continuar con plan gratuito</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  skipButtonText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideScrollView: {
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: Theme.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginTop: Theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingLeft: Theme.spacing.md,
  },
  featureText: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  vehicleOptionsContainer: {
    width: '100%',
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  vehicleOption: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  vehicleOptionIcon: {
    fontSize: 40,
    marginBottom: Theme.spacing.sm,
  },
  vehicleOptionLabel: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  vehicleOptionPlan: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
  },
  startTrialButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startTrialButtonText: {
    color: Colors.white,
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
  },
  continueFreeButton: {
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  continueFreeButtonText: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;

