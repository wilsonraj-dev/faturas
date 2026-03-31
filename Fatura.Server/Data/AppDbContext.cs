using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Compra> Compras => Set<Compra>();
    public DbSet<Parcela> Parcelas => Set<Parcela>();
    public DbSet<FaturaEntity> Faturas => Set<FaturaEntity>();
    public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();
    public DbSet<Simulacao> Simulacoes => Set<Simulacao>();
    public DbSet<SimulacaoParcela> SimulacaoParcelas => Set<SimulacaoParcela>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Compra
        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            entity.HasOne(e => e.Fornecedor)
                  .WithMany(f => f.Compras)
                  .HasForeignKey(e => e.FornecedorId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Compras)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Parcela
        modelBuilder.Entity<Parcela>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Valor).HasPrecision(18, 2);

            entity.HasOne(e => e.Compra)
                  .WithMany(c => c.Parcelas)
                  .HasForeignKey(e => e.CompraId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Fatura)
                  .WithMany(f => f.Parcelas)
                  .HasForeignKey(e => e.FaturaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // FaturaEntity (tabela "Faturas")
        modelBuilder.Entity<FaturaEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            // Índice único por mês/ano/usuário
            entity.HasIndex(e => new { e.Mes, e.Ano, e.UserId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Faturas)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Fornecedor
        modelBuilder.Entity<Fornecedor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Fornecedores)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Simulacao
        modelBuilder.Entity<Simulacao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).HasMaxLength(200);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Simulacoes)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SimulacaoParcela
        modelBuilder.Entity<SimulacaoParcela>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Valor).HasPrecision(18, 2);

            entity.HasOne(e => e.Simulacao)
                  .WithMany(s => s.Parcelas)
                  .HasForeignKey(e => e.SimulacaoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
