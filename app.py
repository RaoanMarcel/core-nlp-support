import streamlit as st
import pandas as pd
import time

# Configuracao da Pagina
st.set_page_config(page_title="Core NLP", layout="wide")

# --- SIDEBAR ---
st.sidebar.title("Core NLP Control")
st.sidebar.write("Status do Motor: Aguardando Treinamento")
st.sidebar.divider()
st.sidebar.subheader("Modulos Monitorados")
st.sidebar.checkbox("Autenticacao", value=True)
st.sidebar.checkbox("Financeiro", value=True)
st.sidebar.checkbox("Performance", value=True)

# --- CABECALHO ---
st.title("Core NLP - Support Intelligence")
st.markdown("---")

# --- METRICAS DE IMPACTO ---
col1, col2, col3, col4 = st.columns(4)
col1.metric("Tickets Recebidos", "24", "+5")
col2.metric("Latencia Media (IA)", "1.2s", "-85%")
col3.metric("Acuracia da Triagem", "0%", "N/A")
col4.metric("Nivel de Risco Geral", "Baixo", "Normal")

st.markdown("---")

# --- AREA DE ENTRADA ---
st.subheader("Entrada de Dados - Analise de Log/Ticket")
with st.container():
    ticket_input = st.text_area(
        "Insira a descricao do problema ou log do sistema:", 
        placeholder="Ex: Falha de timeout ao tentar consultar o banco de dados na tela de faturamento."
    )
    
    col_btn1, col_btn2 = st.columns([1, 5])
    if col_btn1.button("Processar via Core NLP"):
        with st.spinner('Processando analise semantica...'):
            time.sleep(1) # Simulacao de latencia de rede
            st.success("Processamento concluido.")
            st.warning("Aviso: Motor classificador offline. Exibindo dados simulados.")

# --- RESULTADO DA INTELIGENCIA ---
if ticket_input:
    st.divider()
    res_col1, res_col2 = st.columns(2)
    
    with res_col1:
        st.subheader("Diagnostico do Sistema")
        st.write("**Categoria Primaria:** [Aguardando Modelo]")
        st.write("**Analise de Sentimento:** [Aguardando Modelo]")
        st.progress(0, text="Grau de Confianca da Predicao")
        
    with res_col2:
        st.subheader("Base de Conhecimento (RAG)")
        st.info("O sistema indexara os manuais tecnicos e retornara o trecho exato de resolucao neste bloco.")

# --- TABELA DE MONITORAMENTO ---
st.divider()
st.subheader("Monitoramento de Falhas por Modulo")

dados_simulados = {
    "Data": ["07/04", "07/04", "06/04"],
    "Modulo": ["Financeiro", "Autenticacao", "Performance"],
    "Descricao do Erro": ["Timeout na geracao de boleto", "Loop de redirecionamento", "Latencia alta na query principal"],
    "Classificacao IA": ["Critico", "Urgente", "Melhoria"],
    "Status Operacional": ["Aguardando Dev", "Resolvido", "Em Analise"]
}
df = pd.DataFrame(dados_simulados)
st.table(df)