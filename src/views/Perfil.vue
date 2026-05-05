<template>
    <div class="perfil-page">
        <HeaderGeral />
        <main class="perfil-main">
            <section class="content">
                <div class="content-header">
                    <h1>Perfil do Funcionário</h1>
                    <p>Gerencie suas informações pessoais</p>
                </div>
                <div class="profile-card">
                    <div class="profile-card-header">
                        <div class="avatar-section">
                            <div class="avatar">
                                <img v-if="user?.foto" :src="user.foto" alt="Foto do perfil">
                                <i v-else class="fas fa-user"></i>
                            </div>
                            <button @click="changePhoto" class="change-photo-btn">Alterar Foto</button>
                            <input ref="photoInput" type="file" @change="handlePhotoChange" accept="image/*" style="display: none;">
                        </div>
                        <div class="profile-info">
                            <h1>{{ profileName }}</h1>
                        </div>
                        <div class="profile-actions">
                            <div v-if="!editMode" class="action-buttons-group">
                                <button class="edit-btn" @click="editProfile">
                                    Editar Perfil
                                </button>
                                <button class="logout-btn" @click="handleLogout" title="Deslogar da conta">
                                    Sair da Conta
                                </button>
                            </div>
                            <div v-else class="edit-actions">
                                <button class="save-btn" @click="saveProfile">Salvar</button>
                                <button class="cancel-btn" @click="cancelEdit">Cancelar</button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-grid">
                        <div class="info-box">
                            <h2>Informações Pessoais</h2>
                            <div class="info-row">
                                <span>Nome</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.nome" type="text" class="info-input" />
                                    <strong v-else>{{ user?.nome || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Sobrenome</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.sobrenome" type="text"
                                        class="info-input" />
                                    <strong v-else>{{ user?.sobrenome || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Data de Nascimento</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.data_nascimento" type="date"
                                        class="info-input" />
                                    <strong v-else>{{
                                        formatDate(user?.data_nascimento)
                                        }}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <h2>Dados de Contato</h2>
                            <div class="info-row">
                                <span>E-mail</span>
                                <div class="info-value">
                                    <strong>{{ user?.email || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Telefone</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.telefone" type="tel"
                                        class="info-input" />
                                    <strong v-else>{{ user?.telefone || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>CPF</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.cpf" type="text" class="info-input" />
                                    <strong v-else>{{ user?.cpf || "---" }}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <h2>Segurança e Acesso</h2>
                            <div class="info-row">
                                <span>Função</span><strong>Funcionário</strong>
                            </div>
                            <div class="password-section">
                                <button @click="showPasswordModal = true" class="change-password-btn">
                                    Alterar Senha
                                </button>
                            </div>
                            <div class="info-row">
                                <span>Status</span><strong>Ativo</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
                    <div class="modal-content" @click.stop>
                        <h3>Alterar Senha</h3>
                        <form @submit.prevent="changePassword">
                            <div class="form-group">
                                <label>Senha Atual</label>
                                <input v-model="passwordData.current" type="password" required>
                            </div>
                            <div class="form-group">
                                <label>Nova Senha</label>
                                <input v-model="passwordData.new" type="password" required>
                            </div>
                            <div class="form-group">
                                <label>Confirmar Nova Senha</label>
                                <input v-model="passwordData.confirm" type="password" required>
                            </div>
                            <div class="modal-actions">
                                <button type="button" @click="showPasswordModal = false" class="cancel-btn">Cancelar</button>
                                <button type="submit" class="save-btn">Alterar Senha</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import HeaderGeral from "../components/HeaderGeral.vue";
import { ref, computed, onMounted, watch } from "vue";

// Importa o composable de Supabase que contém todas as funções de autenticação
import { useSupabase } from "../composables/useSupabase";
// Importa o router do Vue para navegação entre páginas
import { useRouter } from "vue-router";


// Desestrutura as funções e estado do Supabase
const { session, supabase, signOut } = useSupabase();
const router = useRouter();


// Armazena os dados do usuário logado
const user = ref(null);
// Flag para controlar carregamento de dados
const loading = ref(true);
// Flag para controlar modo de edição
const editMode = ref(false);
// Armazena dados do perfil para edição
const profileData = ref({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
});
// Modal para alterar senha
const showPasswordModal = ref(false);
const passwordData = ref({
    current: '',
    new: '',
    confirm: ''
});
// Ref para input de foto
const photoInput = ref(null);


// Calcula o nome completo do usuário dinamicamente
const profileName = computed(() => {
    if (!user.value) return "Carregando...";
    return `${user.value.nome || ""} ${user.value.sobrenome || ""}`.trim();
});

// Formata data para o padrão brasileiro (dd/mm/yyyy)
const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("pt-BR");
};

// Preenche o formulário com os dados atuais do usuário
const setProfileForm = () => {
    if (!user.value) return;
    profileData.value = {
        nome: user.value.nome || "",
        sobrenome: user.value.sobrenome || "",
        email: user.value.email || "",
        telefone: user.value.telefone || "",
        cpf: user.value.cpf || "",
        data_nascimento: user.value.data_nascimento || "",
    };
};

// Ativa o modo de edição
const editProfile = () => {
    editMode.value = true;
    setProfileForm();
};

// Cancela a edição e revert dados originais
const cancelEdit = () => {
    editMode.value = false;
    setProfileForm();
};

// Salva as alterações do perfil no banco de dados
const saveProfile = async () => {
    if (!user.value) return;

    try {
        // Prepara os dados para atualizar
        const updateData = {
        nome: profileData.value.nome,
        sobrenome: profileData.value.sobrenome,
        telefone: profileData.value.telefone,
        cpf: profileData.value.cpf,
        data_nascimento: profileData.value.data_nascimento || null, 
};

        // Atualiza na tabela de funcionários
        const { data: updated, error } = await supabase
            .from("funcionario")
            .update(updateData)
            .eq("idfuncionario", user.value.idfuncionario)
            .select()
            .single();

        if (error) throw error;

        // Atualiza o objeto user com os novos dados
        user.value = { ...user.value, ...updated };
        editMode.value = false;
        setProfileForm();
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Não foi possível atualizar o perfil.');
    }
};

//Altera senha e foto
const changePassword = async () => {
    if (passwordData.value.new !== passwordData.value.confirm) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const { error } = await supabase.auth.updateUser({
            password: passwordData.value.new
        });

        if (error) throw error;

        alert('Senha alterada com sucesso!');
        showPasswordModal.value = false;
        passwordData.value = { current: '', new: '', confirm: '' };
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        alert('Erro ao alterar senha: ' + error.message);
    }
};

const changePhoto = () => {
    photoInput.value?.click();
};

const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.value.user.id}.${fileExt}`;
        const filePath = `profile-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const urlComCacheBuster = `${data.publicUrl}?t=${new Date().getTime()}`;
        const { error: updateError } = await supabase
            .from("funcionario")
            .update({ foto: urlComCacheBuster })
            .eq("idfuncionario", user.value.idfuncionario);

        if (updateError) throw updateError;

        user.value.foto = urlComCacheBuster;
        alert('Foto atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar foto:', error);
        alert('Erro ao atualizar foto: ' + error.message);
    } finally {
        if (event.target) event.target.value = '';
    }
};


// Esta função é responsável por fazer o logout do usuário
// Quando chamada, limpa a sessão do Supabase e remove dados do localStorage
const handleLogout = async () => {
    try {
        // Pede confirmação ao usuário antes de fazer logout
        const confirmar = window.confirm("Tem certeza que deseja fazer logout?");
        
        if (!confirmar) {
            return; // Se o usuário cancelar, não faz nada
        }

        // Chama a função signOut do Supabase
        // 1. Invalida o token de autenticação no servidor
        // 2. Remove os dados da sessão do localStorage
        // 3. Limpa o estado da sessão
        await signOut();
        
        // Mostra mensagem de sucesso
        alert("Logout realizado com sucesso!");
        
        // Redireciona o usuário para a página de login
        router.push("/login");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao fazer logout: " + error.message);
    }
};

// Carrega todos os dados do perfil do usuário logado
const loadProfile = async () => {
    // Verifica se o usuário está autenticado
    if (!session.value || !session.value.user?.email) {
        // Se não estiver, redireciona para login
        router.push("/login");
        return;
    }

    const email = session.value.user.email;
    const metadata = session.value.user.user_metadata || {};
    
    // Busca o usuário na tabela de funcionários
    const { data: funcData, error: funcError } = await supabase
        .from("funcionario")
        .select("*")
        .ilike("email", email);

    if (funcError || !funcData || funcData.length === 0) {
        alert('Perfil de funcionário não encontrado. Você precisa completar seu cadastro.');
        router.push('/cadastrar');
        return;
    }

    const userData = funcData[0];

    // Enriquece dados com metadata armazenada durante o login
    user.value = {
        ...userData,
        nome: userData.nome || metadata.nome || '',
        sobrenome: userData.sobrenome || metadata.sobrenome || '',
        email: userData.email || email,
    };

    setProfileForm();

    loading.value = false;
};

onMounted(loadProfile);
watch(session, () => {
    if (!user.value) loadProfile();
});
</script>

<style scoped>
/* Layout Principal */
.perfil-page {
  min-height: 100vh;
  background: #293140;
  color: #edf2f7;
}

.perfil-main {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.content {
  width: 100%;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0 0 4px 0;
}

.content-header p {
  color: #a0aec0;
  margin: 0;
}

/* Card Principal de Perfil */
.profile-card {
  background: #1a202c;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3748;
}

.profile-card-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 32px;
}

/* Avatar e Foto */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #3d4555;
  border: 2px solid #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #edf2f7;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-photo-btn {
  background: transparent;
  color: #a0aec0;
  border: 1px solid #4a5568;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.change-photo-btn:hover {
  background: #2d3748;
  color: #fff;
}

/* Informações do Header do Card */
.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0;
  font-size: 2rem;
  color: #ffffff;
  font-weight: bold;
}

/* Botões de Ação */
.profile-actions {
  display: flex;
  gap: 12px;
}

.action-buttons-group,
.edit-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.save-btn,
.cancel-btn,
.logout-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.edit-btn,
.save-btn {
  background: #f05432;
  color: white;
}

.edit-btn:hover,
.save-btn:hover {
  background: #d94a2b;
}

.logout-btn {
  background: transparent;
  color: #fc8181;
  border: 1px solid #fc8181;
}

.logout-btn:hover {
  background: rgba(252, 129, 129, 0.1);
}

.cancel-btn {
  background: transparent;
  color: #a0aec0;
  border: 1px solid #4a5568;
}

.cancel-btn:hover {
  background: #2d3748;
  color: #fff;
}

/* Grid de Informações */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.info-box {
  background: #2d3748;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #4a5568;
}

.info-box h2 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: #f05432;
  border-bottom: 1px solid #4a5568;
  padding-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row span {
  color: #a0aec0;
  font-weight: bold;
  font-size: 0.9rem;
}

.info-value {
  display: flex;
  justify-content: flex-end;
  width: 60%;
}

.info-value strong {
  color: #edf2f7;
  font-weight: 500;
}

.info-input {
  width: 100%;
  background-color: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.info-input:focus {
  outline: none;
  border-color: #f05432;
}

/* Botão de Alterar Senha */
.password-section {
  margin: 16px 0;
}

.change-password-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  color: #f05432;
  border: 1px solid #f05432;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.change-password-btn:hover {
  background: rgba(240, 84, 50, 0.1);
}

/* Modal de Senha */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1a202c;
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  padding: 24px;
  color: #edf2f7;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #2d3748;
}

.modal-content h3 {
  color: #ffffff;
  margin: 0 0 24px 0;
  font-size: 1.4rem;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  color: #a0aec0;
  font-weight: bold;
  font-size: 0.85rem;
}

.form-group input {
  background-color: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #f05432;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  border-top: 1px solid #2d3748;
  padding-top: 16px;
}

/* Responsividade */
@media (max-width: 768px) {
  .perfil-main {
    padding: 16px;
  }

  .profile-card-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons-group {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons-group button,
  .edit-actions button {
    width: 100%;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-value {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>