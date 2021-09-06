import si from 'systeminformation'

export const memRoute = async (req, res) => {
  si.mem()
    .then((data) => {
      res.status(200).json({ ok: true, data })
    })
    .catch((err) => {
      res.status(500).json({
        ok: false,
        message: typeof err === 'string' ? err : err?.message || 'No err.message',
      })
    })
}
