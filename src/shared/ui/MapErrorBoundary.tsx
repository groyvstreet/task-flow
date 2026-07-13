import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPinOff } from 'lucide-react-native';

type Props = {
    children: ReactNode;
    fallback: ReactNode;
};

type State = {
    hasError: boolean;
};

export class MapErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.warn('MapView failed — showing fallback list', error.message, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.wrap}>
                    <View style={styles.banner}>
                        <MapPinOff size={18} color="#b45309" />
                        <Text style={styles.bannerText}>
                            Map unavailable. Add a Google Maps API key (see README) or use the location list below.
                        </Text>
                    </View>
                    {this.props.fallback}
                    <Pressable
                        style={styles.retry}
                        onPress={() => this.setState({ hasError: false })}
                    >
                        <Text style={styles.retryText}>Retry map</Text>
                    </Pressable>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    wrap: { flex: 1 },
    banner: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        backgroundColor: '#fffbeb',
        borderBottomWidth: 1,
        borderBottomColor: '#fde68a',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bannerText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    retry: {
        alignSelf: 'center',
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    retryText: {
        color: '#0f766e',
        fontWeight: '600',
    },
});
