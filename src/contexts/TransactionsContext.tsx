import { createContext, useEffect, useState } from "react";
import { api } from "../lib/axios";

interface Transaction {
    id: number
    description: string
    type: 'income' | 'outcome'
    price: number
    category: string
    createdAt: string
}

interface CreateTransactionInput {
    description: string
    price: number
    category: string
    type: 'income' | 'outcome'
}

interface TransactionContextType {
    transactions: Transaction[],
    fetchTransactions: (query?: string) => Promise<void> //promise pois é uma função assincrona
    createTransaction: (data: CreateTransactionInput) => Promise<void>
}

interface TransactionProviderProps {
    children: React.ReactNode
}

export const TransactionsContext = createContext({} as TransactionContextType)

export function TransactionsProvider({ children }: TransactionProviderProps) {

    const [transactions, setTransactions] = useState<Transaction[]>([])

    //fazendo isso pois o useEffect não pode ser assincrono
    async function fetchTransactions(query?: string) {
        const response = await api.get('/transactions', {
            params: {
                _sort: 'createdAt',
                _order: 'desc',
                q: query
            }
        })

        setTransactions(response.data)
    }

    async function createTransaction(data: CreateTransactionInput) {
        const { description, price, category, type } = data

        const response = await api.post('/transactions', {
            description, //id cria sozinho pelo json server
            price,
            category,
            type,
            createdAt: new Date(),
        })

        setTransactions(state => [response.data, ...state])
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    return (
        <TransactionsContext.Provider
            value={{
                transactions,
                fetchTransactions,
                createTransaction
            }}
        >
            {children}
        </TransactionsContext.Provider>
    )
}