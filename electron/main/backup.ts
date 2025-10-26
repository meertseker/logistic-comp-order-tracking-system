import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export class BackupManager {
  private backupDir: string
  private dbPath: string
  private maxBackups: number = 30 // Son 30 günü tut

  constructor(dbPath: string) {
    this.dbPath = dbPath
    this.backupDir = path.join(app.getPath('userData'), 'backups')
    this.ensureBackupDir()
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  // Manuel yedek al
  async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')
      const backupFileName = `transport_${timestamp}_${time}.db`
      const backupPath = path.join(this.backupDir, backupFileName)

      // Veritabanını kopyala
      await fs.promises.copyFile(this.dbPath, backupPath)
      
      console.log(`✅ Backup created: ${backupFileName}`)
      return backupPath
    } catch (error) {
      console.error('❌ Backup failed:', error)
      throw error
    }
  }

  // Otomatik günlük yedekleme
  startAutoBackup() {
    // İlk yedek hemen al
    this.createBackup()

    // Her gün saat 02:00'de otomatik yedek
    const scheduleNextBackup = () => {
      const now = new Date()
      const next = new Date()
      next.setDate(now.getDate() + 1)
      next.setHours(2, 0, 0, 0) // Saat 02:00

      const timeout = next.getTime() - now.getTime()
      
      setTimeout(() => {
        this.createBackup()
        this.cleanOldBackups()
        scheduleNextBackup() // Bir sonraki için schedule et
      }, timeout)
    }

    scheduleNextBackup()
    console.log('🔄 Auto backup scheduled (daily at 02:00)')
  }

  // Eski yedekleri temizle (son 30 günü tut)
  async cleanOldBackups() {
    try {
      const files = await fs.promises.readdir(this.backupDir)
      const backups = files
        .filter(f => f.startsWith('transport_') && f.endsWith('.db'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time) // Yeniden eskiye

      // Son 30'u tut, geri kalanları sil
      const toDelete = backups.slice(this.maxBackups)
      
      for (const backup of toDelete) {
        await fs.promises.unlink(backup.path)
        console.log(`🗑️ Old backup deleted: ${backup.name}`)
      }

      if (toDelete.length > 0) {
        console.log(`✅ Cleaned ${toDelete.length} old backups`)
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error)
    }
  }

  // Yedekleri listele
  async listBackups(): Promise<Array<{ name: string; path: string; size: number; date: Date }>> {
    try {
      const files = await fs.promises.readdir(this.backupDir)
      const backups = []

      for (const file of files) {
        if (file.startsWith('transport_') && file.endsWith('.db')) {
          const filePath = path.join(this.backupDir, file)
          const stats = await fs.promises.stat(filePath)
          
          backups.push({
            name: file,
            path: filePath,
            size: stats.size,
            date: stats.mtime
          })
        }
      }

      return backups.sort((a, b) => b.date.getTime() - a.date.getTime())
    } catch (error) {
      console.error('Error listing backups:', error)
      return []
    }
  }

  // Yedekten geri yükle
  async restoreBackup(backupPath: string): Promise<boolean> {
    try {
      // Mevcut DB'yi yedekle (güvenlik)
      const emergencyBackup = path.join(this.backupDir, `emergency_${Date.now()}.db`)
      await fs.promises.copyFile(this.dbPath, emergencyBackup)

      // Yedekten geri yükle
      await fs.promises.copyFile(backupPath, this.dbPath)
      
      console.log(`✅ Database restored from backup`)
      return true
    } catch (error) {
      console.error('❌ Restore failed:', error)
      throw error
    }
  }

  // Yedek sil
  async deleteBackup(backupPath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(backupPath)
      console.log(`✅ Backup deleted: ${backupPath}`)
      return true
    } catch (error) {
      console.error('Error deleting backup:', error)
      throw error
    }
  }
}

