<template>
    <div class="about">
        <h1>History</h1>
        <div class="alert alert-info" role="alert">
            <strong>ℹ️ Note:</strong> Checks cannot be deleted once created. You can only void them to mark them as invalid.
        </div>
        <div v-if="history.length === 0">
            <p>No history yet</p>
        </div>
        <div v-else>
            <table class="table">
                <thead>
                    <tr>
                        <th>Check #</th>
                        <th>Amount</th>
                        <th>Payee</th>
                        <th>Account</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in history" :key="item.id" :class="{ 'table-secondary': item.isVoid }">
                        <td>{{ item.checkNumber }}</td>
                        <td>${{ formatMoney(item.amount) }}</td>
                        <td>{{ item.payTo }}</td>
                        <td>{{ item.bankAccountNumber }}</td>
                        <td>
                            <span v-if="item.isVoid" class="badge bg-danger">VOID</span>
                            <span v-else class="badge bg-success">Active</span>
                        </td>
                        <td>
                            <button class="btn btn-outline-warning btn-sm" @click="voidItem(index)" style="margin-right: 10px" :disabled="item.isVoid">
                                {{ item.isVoid ? '✓ Voided' : 'Void Check' }}
                            </button>
                            <button class="btn btn-outline-primary btn-sm" @click="viewItem(index)">View</button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style>
</style>

<script setup>
import {formatMoney} from '../utilities.ts'
import { ref, onMounted} from 'vue'
import { useAppStore } from '../stores/app.ts'
import { useRouter } from 'vue-router'
import { secureStorage } from '../services/secureStorage.ts'

const state = useAppStore()
const router = useRouter()

const history = ref([])

const loadHistory = async () => {
  try {
    const data = await secureStorage.get('checkList')
    if (data) {
      history.value = JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load check history:', e)
  }
}

const voidItem = async (index) => {
  if (confirm('Are you sure you want to void this check? This action marks the check as invalid but keeps it in the records.')) {
    history.value[index].isVoid = true
    await secureStorage.set('checkList', JSON.stringify(history.value))
  }
}

const viewItem = (index) => {
    const item = history.value[index]
    state.check = item
    router.push('/')
}

onMounted(() => {
  loadHistory()
})


</script>
