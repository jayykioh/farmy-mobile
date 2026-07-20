import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { changeAdminPassword } from '../../src/api/admin';

export default function AdminPasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await changeAdminPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmNewPassword: confirmPassword.trim()
      });
      Alert.alert('Thành công', 'Đổi mật khẩu quản trị viên thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader title="Đổi mật khẩu Admin" showBack={true} fallbackHref="/admin" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Bảo mật tài khoản</Text>
          <Text style={styles.formDesc}>
            Cập nhật mật khẩu tài khoản quản trị để bảo vệ hệ thống khỏi các truy cập trái phép.
          </Text>

          <Input
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu đang dùng..."
            secureTextEntry={secureCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            icon={<Lock size={18} color={colors.textMuted} />}
            rightElement={
              <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeBtn}>
                {secureCurrent ? <Eye size={18} color={colors.textMuted} /> : <EyeOff size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            }
          />

          <Input
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
            secureTextEntry={secureNew}
            value={newPassword}
            onChangeText={setNewPassword}
            icon={<Lock size={18} color={colors.textMuted} />}
            rightElement={
              <TouchableOpacity onPress={() => setSecureNew(!secureNew)} style={styles.eyeBtn}>
                {secureNew ? <Eye size={18} color={colors.textMuted} /> : <EyeOff size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            }
          />

          <Input
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới..."
            secureTextEntry={secureConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon={<Lock size={18} color={colors.textMuted} />}
            rightElement={
              <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeBtn}>
                {secureConfirm ? <Eye size={18} color={colors.textMuted} /> : <EyeOff size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            }
          />

          <Button
            title="Đổi mật khẩu"
            isLoading={loading}
            onPress={handlePasswordChange}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: 4,
  },
  formDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 24,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
