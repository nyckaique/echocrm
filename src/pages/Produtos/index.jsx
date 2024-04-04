import Header from "../../components/Header";
import Title from "../../components/Title";
import StoreIcon from "@mui/icons-material/Store";
import "./produtos.css";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import {
  updateDoc,
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import Produto from "../../components/Produto";

const listRef = collection(db, "produtos");
export default function Produtos() {
  const [estaAtualizando, setEstaAtualizando] = useState(false);
  const [nomeProduto, setNomeProduto] = useState("");
  const [valorProduto, setValorProduto] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [index, setIndex] = useState("");
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    function ordenar(a, b) {
      if (a.nomeProduto < b.nomeProduto) {
        return -1;
      }
      if (a.nomeProduto > b.nomeProduto) {
        return 1;
      }
      return 0;
    }
    async function loadProdutos() {
      onSnapshot(listRef, where("user", "==", user.uid), (snapshot) => {
        let lista = [];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            nomeProduto: doc.data().nomeProduto,
            valorProduto: doc.data().valorProduto,
          });
        });
        lista.sort(ordenar);
        setProdutos(lista);
      });
    }
    loadProdutos();
  }, []);

  async function formSubmit() {
    if (nomeProduto !== "" && valorProduto !== "") {
      if (estaAtualizando) {
        let novoNomeProduto =
          nomeProduto.charAt(0).toUpperCase() +
          nomeProduto.slice(1).toLowerCase();
        const docRef = doc(db, "produtos", produtos[index].id);
        await updateDoc(docRef, {
          nomeProduto: novoNomeProduto,
          valorProduto: valorProduto,
        })
          .then(() => {
            setNomeProduto("");
            setValorProduto("");
            setEstaAtualizando(false);
            alert("Atualizado com sucesso!");
          })
          .catch((error) => {
            setNomeProduto("");
            setValorProduto("");
            setEstaAtualizando(false);
            alert("Não foi possível atualizar dados");
          });
      } else {
        let novoNomeProduto =
          nomeProduto.charAt(0).toUpperCase() +
          nomeProduto.slice(1).toLowerCase();
        await addDoc(collection(db, "produtos"), {
          nomeProduto: novoNomeProduto,
          valorProduto: valorProduto,
          user: user.uid,
        })
          .then(() => {
            setNomeProduto("");
            setValorProduto("");
            setEstaAtualizando(false);
            alert("Cadastrado novo produto com sucesso!");
          })
          .catch((error) => {
            setNomeProduto("");
            setValorProduto("");
            setEstaAtualizando(false);
            alert("Não foi possível cadastrar o produto no momento");
          });
      }
    } else {
      alert("Preencha todos os campos!");
    }
  }

  function limpar() {
    setNomeProduto("");
    setValorProduto("");
    setIndex("");
    setEstaAtualizando(false);
  }

  function editProduto(index) {
    setEstaAtualizando(true);
    setIndex(index);
    setNomeProduto(produtos[index].nomeProduto);
    setValorProduto(produtos[index].valorProduto);
  }

  async function deleteProduto(index) {
    // eslint-disable-next-line no-restricted-globals
    const vaiDeletar = confirm(
      `Confirma deletar o produto ${produtos[index].nomeProduto}?`
    );
    if (vaiDeletar) {
      const docRef = doc(db, "produtos", produtos[index].id);
      await deleteDoc(docRef)
        .then(() => {
          alert("Deletado com sucesso!");
        })
        .catch((error) => {
          alert("Não foi possível deletar!");
        });
    }
  }

  function filtrar(e) {
    setFiltro(e.target.value);

    const valor = filtro
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const filtrado = produtos.filter((produto) =>
      produto.nomeProduto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(valor)
    );
    setProdutosFiltrados(filtrado);
  }

  return (
    <div>
      <Header />
      <Title name="Produtos">
        <StoreIcon fontSize="large" />
      </Title>
      <form className="formProduto">
        <h2>Cadastro do Produto/Serviço</h2>
        <div>
          <label>Nome</label>
          <input
            type="text"
            className="inputText"
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
          />
        </div>
        <div>
          <label>Valor</label>
          <input
            type="text"
            className="inputText"
            value={valorProduto}
            onChange={(e) => setValorProduto(e.target.value)}
          />
        </div>
        <div>
          <Button variant="contained" onClick={formSubmit}>
            {estaAtualizando ? "Atualizar Produto" : "Novo Produto"}
          </Button>
          <Button variant="contained" onClick={limpar}>
            Limpar
          </Button>
        </div>
      </form>

      <div className="containerProduto">
        <div>
          Buscar:{" "}
          <input
            type="text"
            onChange={filtrar}
            value={filtro}
            className="inputText"
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Valor</th>
              <th>Editar</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {filtro !== ""
              ? produtosFiltrados.map((produto, index) => {
                  return (
                    <Produto
                      key={index}
                      index={index}
                      nomeProduto={produto.nomeProduto}
                      valorProduto={produto.valorProduto}
                      editProduto={editProduto}
                      deleteProduto={deleteProduto}
                    />
                  );
                })
              : produtos.map((produto, index) => {
                  return (
                    <Produto
                      key={index}
                      index={index}
                      nomeProduto={produto.nomeProduto}
                      valorProduto={produto.valorProduto}
                      editProduto={editProduto}
                      deleteProduto={deleteProduto}
                    />
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
