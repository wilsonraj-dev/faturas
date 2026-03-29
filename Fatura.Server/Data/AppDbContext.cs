using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Compra> Compras => Set<Compra>();
    public DbSet<Parcela> Parcelas => Set<Parcela>();
    public DbSet<FaturaEntity> Faturas => Set<FaturaEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Compra
        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);
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

            // Índice único para evitar faturas duplicadas no mesmo mês/ano
            entity.HasIndex(e => new { e.Mes, e.Ano }).IsUnique();
        });
    }
}
