import { createClient } from "@supabase/supabase-js";
import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Estado global reativo
const session = ref(null);
const loadingSession = ref(true);

// Obtém sessão inicial
supabase.auth.getSession().then(({ data }) => {
  session.value = data.session;
  loadingSession.value = false;
});

// Escuta mudanças na autenticação
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
});

// Helpers para verificar tipo de usuário
const getTipoUsuario = () => {
  return session.value?.user?.user_metadata?.tipo || 'aluno';
};

const isAdmin = () => {
  const tipo = getTipoUsuario();
  return tipo === 'funcionario' || tipo === 'admin';
};

const isAluno = () => {
  return getTipoUsuario() === 'aluno';
};

export function useSupabase() {
  // AUTENTICAÇÃO
  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tipo: userData.type,
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          cpf: userData.cpf,
          funcao: userData.funcao
        }
      }
    });
    
    if (error) throw error;
    console.log('Usuário criado. Trigger criará o registro na tabela correta.');
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;

    const tipoUsuario = data.user?.user_metadata?.tipo;
    console.log("Login bem-sucedido. Tipo:", tipoUsuario);

    return {
      user: data.user,
      session: data.session,
      tipo: tipoUsuario
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // FUNCIONÁRIOS
  const getFuncionarios = async () => {
    const { data, error } = await supabase.from("funcionario").select("*");
    if (error) throw error;
    return data;
  };

  const addFuncionario = async (funcionario) => {
    const { data, error } = await supabase
      .from("funcionario")
      .insert([funcionario]);
    if (error) throw error;
    return data;
  };

  const updateFuncionario = async (id, funcionario) => {
    const { data, error } = await supabase
      .from("funcionario")
      .update(funcionario)
      .eq("idfuncionario", id);
    if (error) throw error;
    return data;
  };

  const deleteFuncionario = async (id) => {
    const { error } = await supabase
      .from("funcionario")
      .delete()
      .eq("idfuncionario", id);
    if (error) throw error;
    return true;
  };

  // ALUNOS
  const getAlunos = async () => {
    const { data, error } = await supabase.from("aluno").select("*").order('nome', { ascending: true });
    if (error) throw error;
    return data;
  };

  const addAluno = async (aluno) => {
    const { data, error } = await supabase
      .from("aluno")
      .insert([aluno]);
    if (error) throw error;
    return data;
  };

  const updateAluno = async (id, aluno) => {
    const { data, error } = await supabase
      .from("aluno")
      .update(aluno)
      .eq("idaluno", id);
    if (error) throw error;
    return data;
  };

  const deleteAluno = async (id) => {
    const { error } = await supabase
      .from("aluno")
      .delete()
      .eq("idaluno", id);
    if (error) throw error;
    return true;
  };

  const getAlunoComEPIs = async (alunoId) => {
    const { data, error } = await supabase
      .from("aluno_has_epis")
      .select(`
        id_entrega_aluno,
        data_entrega,
        epis:epis_id (idepis, nome, tipo, codigo_patrimonio)
      `)
      .eq("aluno_id", alunoId);
    
    if (error) throw error;
    return data || [];
  };

  // EPIs
  const getEPIs = async () => {
    const { data, error } = await supabase.from("epis").select("*");
    if (error) throw error;
    return data;
  };

  const addEPI = async (epi) => {
    const { data, error } = await supabase.from("epis").insert([epi]);
    if (error) throw error;
    return data;
  };

  const deleteEPI = async (id) => {
    const { error } = await supabase.from("epis").delete().eq("idepis", id);
    if (error) throw error;
    return true;
  };

  const updateEPI = async (id, epi) => {
    const { data, error } = await supabase.from("epis").update(epi).eq("idepis", id);
    if (error) throw error;
    return data;
  };

  // DASHBOARD
  const getDashboardStats = async () => {
    const { data: todos, error: e1 } = await supabase.from("epis").select("*");
    const { data: entregas, error: e2 } = await supabase.from("aluno_has_epis").select("*");
    
    if (e1 || e2) throw new Error('Erro ao buscar estatísticas');
    
    const total = todos.length;
    const emUso = entregas.length;
    const disponivel = total - emUso;
    
    return {
      total,
      disponivel,
      emUso,
      percentualDisponibilidade: total > 0 ? ((disponivel / total) * 100).toFixed(1) : 0
    };
  };

  const getEntregasRecentes = async (limite = 5) => {
    const { data, error } = await supabase.from("aluno_has_epis").select(`
      id_entrega_aluno,
      data_entrega,
      aluno:aluno_id (nome, sobrenome),
      epis:epis_id (nome, tipo)
    `)
    .order('data_entrega', { ascending: false })
    .limit(limite);
    
    if (error) throw error;
    return data;
  };

  const getEstoquePerTipo = async () => {
    const { data, error } = await supabase.from("epis").select("tipo, quantidade");
    if (error) throw error;
    
    const estoque = {};
    data.forEach(epi => {
      if (!estoque[epi.tipo]) {
        estoque[epi.tipo] = 0;
      }
      estoque[epi.tipo] += epi.quantidade || 0;
    });
    
    return Object.entries(estoque).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
  };

  const alertasEPIs = async () => {
    const { data, error } = await supabase.from("epis")
      .select("*")
      .lt('data_validade', new Date().toISOString().split('T')[0]);
    
    if (error) throw error;
    return data || [];
  };

  const getFuncionarioComEPIs = async () => {
    const { data, error } = await supabase.from("funcionario_has_epis").select(`
      id_entrega_func,
      data_entrega,
      data_devolucao,
      funcionario:funcionario_id (nome, sobrenome, email),
      epis:epis_id (nome, tipo, codigo_patrimonio)
    `)
    .is('data_devolucao', null)
    .limit(10);
    
    if (error) throw error;
    return data;
  };

  const getAlunoComEPIsAtrasados = async () => {
    const { data, error } = await supabase.from("aluno_has_epis").select(`
      id_entrega_aluno,
      data_entrega,
      aluno:aluno_id (nome, sobrenome, email),
      epis:epis_id (nome, tipo, codigo_patrimonio)
    `)
    .limit(10);
    
    if (error) throw error;
    return data || [];
  };

  const registrarEntregaEPI = async (alunoId, episId, dataEntrega) => {
    try {
      // Primeiro tenta usar a função RPC se existir
      const { data, error } = await supabase.rpc('registrar_entrega_epi', {
        p_aluno_id: alunoId,
        p_epis_id: episId,
        p_data_entrega: dataEntrega
      });

      if (error) {
        console.warn('RPC não disponível, tentando insert direto:', error);
        // Se a RPC não existir, tenta o insert direto
        const { data: insertData, error: insertError } = await supabase
          .from('aluno_has_epis')
          .insert([{
            aluno_id: alunoId,
            epis_id: episId,
            data_entrega: dataEntrega
          }])
          .select();
        
        if (insertError) throw insertError;
        return insertData;
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar entrega:', error);
      throw error;
    }
  };

  // Remove um EPI da tabela aluno_has_epis (quando devolve)
  const removerEntregaEPI = async (alunoId, episId) => {
    const { error } = await supabase
      .from('aluno_has_epis')
      .delete()
      .eq('aluno_id', alunoId)
      .eq('epis_id', episId);

    if (error) throw error;
    return true;
  };

  return {
    // Estado
    session,
    loadingSession,
    supabase,
    
    // Autenticação
    signUp,
    signIn,
    signOut,
    
    // Helpers
    getTipoUsuario,
    isAdmin,
    isAluno,
    
    // Funcionários
    getFuncionarios,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    
    // Alunos
    getAlunos,
    addAluno,
    updateAluno,
    deleteAluno,
    getAlunoComEPIs,
    
    // EPIs
    getEPIs,
    addEPI,
    deleteEPI,
    updateEPI,
    
    // Dashboard
    getDashboardStats,
    getEntregasRecentes,
    getEstoquePerTipo,
    alertasEPIs,
    getFuncionarioComEPIs,
    getAlunoComEPIsAtrasados,
    
    // Entregas de EPIs
    registrarEntregaEPI,
    removerEntregaEPI
  };
}