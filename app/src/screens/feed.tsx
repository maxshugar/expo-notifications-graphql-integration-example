import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../context/notification";
import { REGISTER_PUSH_TOKEN_MUTATION, SEND_NOTIFICATION_MUTATION } from "../gql/mutation";
import { NOTIFICATIONS_FEED_QUERY } from "../gql/query";

type Notification = {
	id: string;
	message: string;
	read: boolean;
};

type NotificationsFeedData = {
	notificationsFeed: Notification[];
};

export const FeedScreen: React.FC = () => {
	const { expoPushToken, hasUnreadNotifications, setHasUnreadNotifications } = useNotifications();
	const [feedback, setFeedback] = useState<string>("");
	const [loadingAction, setLoadingAction] = useState<boolean>(false);

	const { loading, error, data, refetch } = useQuery<NotificationsFeedData>(NOTIFICATIONS_FEED_QUERY);

	const [registerPushToken] = useMutation(REGISTER_PUSH_TOKEN_MUTATION, {
		onCompleted: (data) => {
			if (data.registerPushToken === false) {
				setFeedback("Error registering push token: No push token registered");
			} else {
				setFeedback("Push token registered successfully!");
			}
			setLoadingAction(false);
		},
		onError: (error) => {
			setFeedback(`Error registering push token: ${error.message}`);
			setLoadingAction(false);
		},
	});

	const [sendNotification] = useMutation(SEND_NOTIFICATION_MUTATION, {
		onCompleted: (data) => {
			if (data.sendNotification === false) {
				setFeedback("Error sending notification: No push token registered");
			} else {
				setFeedback("Notification sent successfully!");
			}
			setLoadingAction(false);
		},
		onError: (error) => {
			setFeedback(`Error sending notification: ${error.message}`);
			setLoadingAction(false);
		},
	});

	useEffect(() => {
		if (hasUnreadNotifications) {
			console.log('Calling the API to mark notifications as read...');
			setHasUnreadNotifications(false);
			refetch();
		}
	}, [hasUnreadNotifications, refetch, setHasUnreadNotifications]);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.tokenText}>Your expo push token: {expoPushToken}</Text>
			<Text style={styles.status}>Has unread notifications: {hasUnreadNotifications ? 'Yes' : 'No'}</Text>
			{loadingAction ? <ActivityIndicator size="small" color="#0000ff" /> : null}
			<Text style={styles.feedback}>{feedback}</Text>
			<Button
				title="Register Push Token"
				onPress={() => {
					if (expoPushToken) {
						setLoadingAction(true);
						registerPushToken({ variables: { token: expoPushToken } });
					}
				}}
			/>
			<Button
				title="Send Notification"
				onPress={() => {
					setLoadingAction(true);
					sendNotification({ variables: { message: "Test notification from the server" } });
				}}
			/>
			<Button
				title="Send Notification with 5 second dely"
				onPress={() => {
					setLoadingAction(true);
					sendNotification({ variables: { message: "Test notification from the server", delay: 5 } });
				}}
			/>
			{loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
			{error ? <Text style={styles.error}>Error loading notifications</Text> : null}
			{data?.notificationsFeed.map(({ id, message, read }) => (
				<View key={id} style={styles.notification}>
					<Text>{`${message} - Read: ${read ? 'Yes' : 'No'}`}</Text>
				</View>
			))}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
	},
	tokenText: {
		marginBottom: 10,
		fontSize: 16,
	},
	status: {
		marginBottom: 20,
		fontSize: 16,
	},
	feedback: {
		marginBottom: 10,
		fontSize: 14,
		color: 'green',
	},
	error: {
		marginBottom: 10,
		fontSize: 14,
		color: 'red',
	},
	notification: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
		backgroundColor: '#eee',
		marginBottom: 5,
	},
});
