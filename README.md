# POS System

A RESTful shop management and point-of-sale backend, built for tills that stay fast under
a queue while staying exactly correct about money.

## The problem with mobile-money settlement

M-PESA confirms asynchronously. The callback arrives after the customer expects to walk
away, so a naive implementation either makes the customer wait or records a payment that
may never actually settle.

This system treats a sale as settled only when the callback confirms it. A slow or lost
confirmation leaves the sale visibly pending rather than silently marking it paid, so the
books reflect money that genuinely arrived.

## Design

- Strict REST resource modelling for shop, stock and sale entities
- High-throughput till operations
- Payment settlement driven by M-PESA callbacks, not by optimistic client state

## Stack

REST API · M-PESA Daraja · PostgreSQL · Python
